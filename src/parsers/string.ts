import path from 'path';
import fs from 'fs';

import ParserBase from './base';
import type { default as WzDataTree } from '../modules/WzDataTree';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, Config.StringWzFile);

class StringParser extends ParserBase {
  saveRoot: string;
  constructor(wzData: WzDataTree) {
    super(Config.StringWzFile, wzPath, wzData);
    this.saveRoot = path.join(Config.OUTPUT_ROOT, Config.StringOutput);
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    const typeName = Config.StringTypes[0];
    const savePath = path.join(this.saveRoot, 'String.img.json');
    const wzPath = typeName;
    const typeJson = (await this.getJson(wzPath)) as unknown as any;
    for (const key in typeJson) {
      if (
        !key.startsWith('2670') &&
        !key.startsWith('2671') &&
        !key.startsWith('2672')
      ) {
        delete typeJson[key];
      }
    }
    fs.writeFileSync(savePath, JSON.stringify(typeJson, null, 2));
  }
}

export default StringParser;
