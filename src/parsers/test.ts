import path from 'path';
import fs from 'fs';

import ParserBase from './base';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, 'Obj_016.wz');

class TestParser extends ParserBase {
  saveRoot: string;
  constructor() {
    super(Config.HouseMapWzFile, wzPath);
    this.saveRoot = path.join(Config.OUTPUT_ROOT, 'test');
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    const savePath = path.join(this.saveRoot, `test.json`);
    const typeJson = await this.getJson();
    console.log(this._root);
    fs.writeFileSync(savePath, JSON.stringify(typeJson, null, 2));
  }
}

export default TestParser;
