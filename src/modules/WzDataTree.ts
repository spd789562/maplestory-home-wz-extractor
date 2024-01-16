import _fs from 'fs';
import path from 'path';
import { WzFile, WzDirectory, WzMapleVersion, WzImage } from '@tybys/wz';

const fs = _fs.promises;

export class WzDataNode {
  folders: WzDataNode[] = [];
  /** all wz path in current node */
  wzs: string[] = [];
  /** resolved WzFile */
  _wzFiles: WzFile[] = [];
  wz?: WzDirectory = undefined;
  _isParsed = false;
  constructor(public name: string) {}
  isParsed(): this is WzDataNode & { wz: WzDirectory } {
    return this._isParsed;
  }
  hasWZ() {
    return this.wzs.length > 0;
  }
  async parseWZ(version: WzMapleVersion) {
    for await (const file of this.wzs) {
      const wz = new WzFile(file, version);
      await wz.parseWzFile();
      this._wzFiles.push(wz);
      if (wz.wzDirectory) {
        if (this.wz) {
          for (const image of Array.from(wz.wzDirectory.wzImages)) {
            this.wz.addImage(image);
          }
        } else {
          this.wz = wz.wzDirectory;
        }
      }
    }
    this._isParsed = true;
  }
  async getImg(p: string) {
    if (!this.isParsed()) {
      throw new Error('WZ not parsed');
    }
    const target = this.wz.at(p);
    if (target instanceof WzImage && !target.parsed) {
      await target.parseImage();
    }
    return target;
  }
  dispose() {
    for (const folder of this.folders) {
      folder.dispose();
    }
    for (const wz of this._wzFiles) {
      wz.dispose();
    }
  }
}

class WzDataTree {
  folders: WzDataNode[] = [];
  constructor(
    public root: string,
    public wzVersion: WzMapleVersion,
  ) {}
  async initialize() {
    await this.resolveFolder(this.root);
  }
  async resolveFolder(folder: string, root?: WzDataNode) {
    const folderName = path.basename(folder);
    const files = await fs.readdir(folder);
    for await (const file of files) {
      const filePath = path.join(folder, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        const node = new WzDataNode(file);
        if (root) {
          root.folders.push(node);
        } else {
          this.folders.push(node);
        }
        await this.resolveFolder(filePath, node);
      } else if (root && new RegExp(`^${folderName}_[0-9]+\.wz$`).test(file)) {
        root.wzs.push(filePath);
      }
    }
  }
  async get(p: string) {
    const normalizedPath = path.normalize(p);
    const pathes = normalizedPath.split(path.sep);
    const root = this.folders.find((f) => f.name === pathes[0]);
    if (!root) {
      return undefined;
    }
    let current = root;
    const isIncludeImg = normalizedPath.includes('.img');
    const afterImg = isIncludeImg ? normalizedPath.split(/\.img[\\\/]/)[1] : undefined;
    for await (const path of pathes.slice(1)) {
      const folder = current.folders.find((f) => f.name === path);
      if (!folder) {
        if (current.hasWZ()) {
          if (!current.isParsed()) {
            await current.parseWZ(this.wzVersion);
          }
          const img = await current.getImg(path);
          if (afterImg && img) {
            return (img as WzImage).getFromPath(afterImg);
          }
          return img;
        }
        return undefined;
      }
      current = folder;
    }
    if (current.hasWZ()) {
      if (!current.isParsed()) {
        await current.parseWZ(this.wzVersion);
      }
      return current.wz;
    }
    return current;
  }
  dispose() {
    for (const folder of this.folders) {
      folder.dispose();
    }
  }
  [Symbol.dispose]() {
    this.dispose();
  }
}

export default WzDataTree;
