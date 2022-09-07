import path from 'path';
import fs from 'fs';

import ParserBase from './base';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, Config.StringWzFile);

class StringParser extends ParserBase {
  saveRoot: string;
  constructor() {
    super(Config.StringWzFile, wzPath);
    this.saveRoot = path.join(Config.OUTPUT_ROOT, Config.StringOutput);
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    for await (const typeName of Config.StringTypes) {
      const savePath = path.join(this.saveRoot, `${typeName}.json`);
      const wzPath = typeName;
      const typeJson = await this.getJson(wzPath);
      Object.keys(typeJson).forEach((key) => {
        if (!key.startsWith('2671') && !key.startsWith('2672')) {
          delete typeJson[key];
        }
      });
      fs.writeFileSync(savePath, JSON.stringify(typeJson, null, 2));
    }
  }
}

export default StringParser;
