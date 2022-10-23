import {
  WzFile,
  WzObject,
  WzDirectory,
  WzImage,
  WzObjectType,
  WzPropertyType,
  WzImageProperty,
  WzCanvasProperty,
  WzConvexProperty,
  WzVectorProperty,
  WzSubProperty,
  walkDirectory,
  walkPropertyContainer,
} from '@tybys/wz';
import path from 'path';
import fs from 'fs';
import Config from '../../config';

function preventBigIntSave(value: any) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

function addToPath(obj: any, path: string, value: any) {
  const pathes = path.split(/[\\/]/);
  const dest = pathes.pop() as string;
  if (!dest || dest === '_hash') {
    return obj;
  }
  let curr: any = obj;
  for (const p of pathes) {
    if (p) {
      if (!curr[p]) {
        curr[p] = {};
      }
      curr = curr[p];
    }
  }
  curr[dest] = typeof value === 'bigint' ? value.toString() : value;
  return obj;
}

class ParserBase {
  _wz!: WzFile;
  _root!: WzDirectory;
  _reduentPath: string;
  _isinitialized = false;
  wzName: string;
  wzPath: string;
  constructor(wzName: string, wzPath: string) {
    this.wzName = wzName;
    this.wzPath = wzPath;
    this._reduentPath = '';
    if (!fs.existsSync(wzPath)) {
      throw new Error(`${wzPath} not exist`);
    }
  }
  async initialize() {
    this._wz = new WzFile(this.wzPath, Config.WZ_VERSION);
    await this._wz.parseWzFile();
    if (this._wz.wzDirectory) {
      const rootPath = this._wz.wzDirectory.fullPath;
      this._root = this._wz.wzDirectory;
      this._reduentPath = `${rootPath}\\`;
    }
    this._isinitialized = true;
  }
  initializeChecker() {
    if (!this._isinitialized) {
      throw new Error('WZ file not initialized');
    }
  }
  removeReduentPath(path: string) {
    this.initializeChecker();
    return path.replace(this._reduentPath, '');
  }
  getByRelativePath(current: WzObject, relativePath: string) {
    this.initializeChecker();
    const currentPath = this.removeReduentPath(current.fullPath);
    const destPath = path.join(currentPath, relativePath);
    if (destPath.startsWith('.')) {
      // out side
    }
    // getObjectFromPath has incorrect check, need to avoid it
    return destPath;
  }
  getObjectFromRoot(path: string) {
    return this._wz.getObjectFromPath('trashpath/' + path, false);
  }
  imageCallback(name: string, bitmap: any) {
    // console.log('need to implement imageCallback');
  }
  async getImages(startAt?: string, callback?: any) {
    let images: any[] = [];
    const root = startAt
      ? (this.getObjectFromRoot(startAt) as WzImage)
      : this._root;
    const walkfunc =
      root.objectType === WzObjectType.Directory
        ? walkDirectory
        : walkPropertyContainer;
    await walkfunc(root as any, async (obj: any) => {
      if (obj.propertyType === WzPropertyType.Canvas) {
        const getBitmap = async (obj: WzCanvasProperty) => {
          let img = null;
          try {
            if (obj.haveInlinkProperty() || obj.haveOutlinkProperty()) {
              img = await obj.getLinkedWzCanvasBitmap();
            } else {
              img = await obj.getBitmap();
            }
          } catch (e) {
            // console.log(e);
          }
          return img;
        };
        const bitmap = await getBitmap(obj as WzCanvasProperty);
        if (bitmap) {
          images.push({
            name: obj.fullPath,
            bitmap,
          });
          callback && callback(obj.fullPath, bitmap);
        }
      }
      return false;
    });
    return images;
  }
  async getJson(startAt?: string) {
    this.initializeChecker();
    let tree: any = {};
    let index = -1;
    const root = startAt
      ? (this.getObjectFromRoot(startAt) as WzImage)
      : this._root;
    if (!root) {
      console.log('[ERROR] root not found', startAt);
      return tree;
    }
    const walkfunc =
      root.objectType === WzObjectType.Directory
        ? walkDirectory
        : walkPropertyContainer;
    await walkfunc(root as any, async (obj: WzObject) => {
      const _path = this.removeReduentPath(obj.fullPath);
      const _basePath = startAt
        ? _path.replace(`${startAt}`, '').replace(/^[\\|/]/, '')
        : _path;

      // startAt && console.log(_path, startAt, _basePath);
      // console.log(_basePath);
      switch (obj.objectType) {
        case WzObjectType.Directory:
        case WzObjectType.Image:
          // this may not necessary
          addToPath(tree, _basePath, {});
          break;
        case WzObjectType.Property:
          switch ((obj as WzImageProperty).propertyType) {
            case WzPropertyType.Canvas:
              const hasLink =
                (obj as WzCanvasProperty).haveInlinkProperty() ||
                (obj as WzCanvasProperty).haveOutlinkProperty();
              const canvas = (await (
                obj as WzCanvasProperty
              ).getBitmap()) as any;
              addToPath(tree, `${_basePath}\\_imageData`, {
                width: preventBigIntSave(canvas._canvas.bitmap?.width),
                height: preventBigIntSave(canvas._canvas.bitmap?.height),
              });
              (obj as WzCanvasProperty).getProperty('origin') &&
                addToPath(tree, `${_basePath}\\origin`, {
                  x: preventBigIntSave(
                    (
                      (obj as WzCanvasProperty).getProperty(
                        'origin'
                      ) as WzVectorProperty
                    ).x?.value
                  ),
                  y: preventBigIntSave(
                    (
                      (obj as WzCanvasProperty).getProperty(
                        'origin'
                      ) as WzVectorProperty
                    ).y?.value
                  ),
                });
            case WzPropertyType.Vector:
            case WzPropertyType.Convex:
            case WzPropertyType.SubProperty:
            default:
              if ((obj as any).value !== undefined) {
                // tree[obj.name] = (obj as any).value;
                const value = (obj as any).value;
                let _val = value;
                if (
                  typeof value === 'string' &&
                  obj.name !== '_inlink' &&
                  obj.name !== '_outlink'
                ) {
                  const isRelativePath = value.startsWith('.');
                  if (isRelativePath) {
                    const path = this.getByRelativePath(obj, `..\\${value}`);
                    const relativeJson = await this.getJson(path);
                    if (relativeJson) {
                      _val = relativeJson;
                    }
                  }
                }
                addToPath(tree, _basePath, _val);
              }
            // return false;
          }
      }

      if ((obj as WzImageProperty).propertyType === WzPropertyType.Canvas) {
        const getBitmap = async (obj: WzCanvasProperty) => {
          let img = null;
          try {
            if (obj.haveInlinkProperty() || obj.haveOutlinkProperty()) {
              img = await obj.getLinkedWzCanvasBitmap();
            }
          } catch (e) {}
          try {
            if (!img) {
              img = await obj.getBitmap();
            }
          } catch (e) {}
          return img;
        };
        const bitmap = await getBitmap(obj as WzCanvasProperty);
        if (bitmap) {
          this.imageCallback(obj.fullPath, bitmap);
        }
      }

      return false;
    });
    return tree;
  }
  dispose() {
    this._wz && this._wz.dispose();
  }
}

/* WzLuaProperty
WzBinaryPropertyType
WzBinaryProperty
WzCanvasProperty
WzConvexProperty
WzDoubleProperty
WzFloatProperty
WzIntProperty
WzLongProperty
WzNullProperty
WzPngProperty
WzShortProperty
WzStringProperty
WzSubProperty
WzUOLProperty
WzVectorProperty */

export default ParserBase;
