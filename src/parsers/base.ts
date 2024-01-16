import {
  WzFile,
  WzObject,
  WzDirectory,
  WzImage,
  WzCanvasProperty,
  walkDirectory,
  walkPropertyContainer,
  Canvas,
  WzStringProperty,
} from '@tybys/wz';
import path from 'path';
import fs from 'fs';
import JSONTree, { JSONValue } from '../util/JsonTree';
import type WzDataTree from '../modules/WzDataTree';
import {
  isDirectory,
  isWzImage,
  isProperty,
  isCanvasProperty,
  isVectorProperty,
} from '../util/propertyHelper';

function preventBigIntSave(value: number | bigint) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

class ParserBase {
  _wz!: WzFile;
  _root!: WzDirectory;
  _reduentPath: string;
  _isinitialized = false;
  _canvasDict: { [key: string]: WzImage } = {};
  wzName: string;
  wzPath: string;
  wzData: WzDataTree;
  constructor(wzName: string, wzPath: string, wzData: WzDataTree) {
    this.wzName = wzName;
    this.wzPath = wzPath;
    this.wzData = wzData;
    this._reduentPath = '';
    if (!fs.existsSync(wzPath)) {
      throw new Error(`${wzPath} not exist`);
    }
  }
  async initialize() {
    const directory = (await this.wzData.get(this.wzName)) as unknown;
    if (!directory || !(directory instanceof WzDirectory)) {
      throw new Error(
        `${this.wzName} should be wz root like "Item/Consume", not img`,
      );
    }
    // this._wz = new WzFile(this.wzPath, Config.WZ_VERSION);
    // await this._wz.parseWzFile();
    if (directory) {
      const indexWzFileReg = /[\\\/](\w+_[0-9]+\.wz)$/;
      const rootPath = directory.fullPath.replace(indexWzFileReg, '');
      this._root = directory;
      this._reduentPath = `${rootPath}\\`;
    }
    this._isinitialized = true;
  }
  initializeChecker() {
    if (!this._isinitialized) {
      throw new Error('WZ file not initialized');
    }
  }
  async resolveCanvasOutLink(path: string) {
    if (!path.includes('_Canvas')) {
      return null;
    }
    const [beforeImg, afterImg] = path.split('.img/');
    const pathIncludeImg = `${beforeImg}.img`;
    const img = (await this.wzData.get(pathIncludeImg)) as WzImage;
    if (afterImg) {
      return img.getFromPath(afterImg);
    }
    return img;
  }
  removeReduentPath(path: string) {
    const indexWzFileReg = /(\w+_[0-9]+\.wz)[\\\/]/;
    this.initializeChecker();
    return path.replace(this._reduentPath, '').replace(indexWzFileReg, '');
  }
  getByRelativePath(current: WzObject, relativePath: string) {
    this.initializeChecker();
    const currentPath = this.removeReduentPath(current.fullPath || '');
    const destPath = path.join(currentPath, relativePath);

    if (destPath.startsWith('.')) {
      // outside
    }
    // getObjectFromPath has incorrect check, need to avoid it
    return destPath;
  }
  async getObjectFromRoot(path: string) {
    return this.wzData.get(path);
  }
  imageCallback(name: string, bitmap: Canvas) {
    // console.log('need to implement imageCallback');
  }
  async getJson(startAt?: string) {
    this.initializeChecker();
    const jsonTree = new JSONTree();

    const root = startAt
      ? ((await this.getObjectFromRoot(
          `${this.wzName}\\${startAt}`,
        )) as unknown as WzImage)
      : this._root;
    if (!root) {
      console.log('[ERROR] root not found', startAt);
      return jsonTree.value;
    }
    const walkDirectoryCallback = async (obj: WzObject) => {
      const _path = this.removeReduentPath(obj.fullPath);
      const _basePath = startAt
        ? _path.replace(`${startAt}`, '').replace(/^[\\|/]/, '')
        : _path;

      if (isDirectory(obj) || isWzImage(obj)) {
        jsonTree.add(_basePath);
      }
      if (isProperty(obj)) {
        if (isCanvasProperty(obj)) {
          const canvas = await obj.getBitmap();
          /* resolve size */
          jsonTree.add(`${_basePath}\\_imageData`, {
            width: preventBigIntSave(canvas?.getCanvas()?.bitmap?.width || 0),
            height: preventBigIntSave(canvas?.getCanvas()?.bitmap?.height || 0),
          });
          /* resolve offest */
          const origin = obj.getProperty('origin');
          if (origin && isVectorProperty(origin)) {
            jsonTree.add(`${_basePath}\\origin`, {
              x: preventBigIntSave(origin?.x?.value || 0),
              y: preventBigIntSave(origin?.y?.value || 0),
            });
          }

          /* resolve actual image */
          const getBitmap = async (obj: WzCanvasProperty) => {
            let img = null;
            try {
              if (obj.haveInlinkProperty()) {
                img = await obj.getLinkedWzCanvasBitmap();
              } else if (obj.haveOutlinkProperty()) {
                const outlink = obj.getProperty('_outlink') as WzStringProperty;
                const linkedNode = await this.resolveCanvasOutLink(
                  outlink.value,
                );
                if (
                  linkedNode &&
                  isProperty(linkedNode) &&
                  isCanvasProperty(linkedNode)
                ) {
                  img = await linkedNode.getBitmap();

                  /* use out link value */
                  jsonTree.add(`${_basePath}\\_imageData`, {
                    width: preventBigIntSave(
                      img?.getCanvas()?.bitmap?.width || 0,
                    ),
                    height: preventBigIntSave(
                      img?.getCanvas()?.bitmap?.height || 0,
                    ),
                  });
                }
              }
            } catch (e) {}
            try {
              if (!img) {
                img = await obj.getBitmap();
              }
            } catch (e) {}
            return img;
          };
          const bitmap = await getBitmap(obj);
          if (bitmap) {
            this.imageCallback(
              obj.fullPath.replace(/(\w+_[0-9]+\.wz)[\\\/]/, ''),
              bitmap,
            );
          }
        } else {
          const hasValue = 'value' in obj && obj.value !== undefined;
          const value = hasValue ? obj.value : null;
          const isRelativePath =
            hasValue &&
            typeof value === 'string' &&
            obj.name !== '_inlink' &&
            obj.name !== '_outlink' &&
            value.startsWith('.');
          /* need to take care relative path value, it stupid */
          if (isRelativePath) {
            const path = this.getByRelativePath(obj, `..\\${value}`);
            const relativeJson = await this.getJson(path);
            if (relativeJson) {
              // console.log("success retrieve relative path's json from", path);
              jsonTree.add(_basePath, relativeJson);
            } else {
              console.log(
                '[ERROR] failed retrieve relative path json from',
                path,
              );
            }
          } else if (
            typeof value !== 'string' ||
            // outpath conatins _Canvas is already handled
            (typeof value === 'string' && !value.includes('/_Canvas/'))
          ) {
            jsonTree.add(_basePath, value as JSONValue);
          }
        }
      }

      return false;
    };

    await (isDirectory(root)
      ? walkDirectory(root, walkDirectoryCallback)
      : walkPropertyContainer(root, walkDirectoryCallback));
    return jsonTree.value;
  }
  dispose() {
    this._wz?.dispose();
  }
  [Symbol.dispose]() {
    this._wz?.dispose();
  }
}

export default ParserBase;
