import path from 'path';
import fs from 'fs';

import ParserBase from './base';
import type { default as WzDataTree } from '../modules/WzDataTree';

import {
  WzFile,
  WzObject,
  walkWzFileAsync,
  WzPropertyType,
  WzObjectType,
  WzImageProperty,
} from '@tybys/wz';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, 'Map/Map/Map8/Map8.wz');

class TestParser extends ParserBase {
  saveRoot: string;
  constructor(wzData: WzDataTree) {
    super(Config.HouseMapWzFile, wzPath, wzData);
    this.saveRoot = path.join(Config.OUTPUT_ROOT, 'test');
  }
  async initialize() {
    this._wz = new WzFile(this.wzPath, Config.WZ_VERSION);
    await this._wz.parseWzFile();
    if (this._wz.wzDirectory) {
      const rootPath = this._wz.wzDirectory.fullPath;
      this._root = this._wz.wzDirectory;
      this._reduentPath = `${rootPath}\\`;
    }
    // for (const image of Array.from(this._root.wzImages)) {
    //   console.log(image.name);
    // }

    const test = await this.wzData.get('Etc/_Canvas/EmotionEffect.img');
    console.log(test);
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    const savePath = path.join(this.saveRoot, 'test.json');
    const typeJson = await this.getJson();
    console.log(this._root);
    fs.writeFileSync(savePath, JSON.stringify(typeJson, null, 2));
  }
}

export default TestParser;
