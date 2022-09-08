import path from 'path';
import fs from 'fs';

import ParserBase from './base';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, Config.ThemeWzFile);

class ThemeParser extends ParserBase {
  saveRoot: string;
  constructor() {
    super(Config.ThemeWzFile, wzPath);
    this.saveRoot = path.join(Config.OUTPUT_ROOT, Config.ThemeOutput);
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    for await (const typeName of Config.ThemeTypes) {
      const savePath = path.join(this.saveRoot, `${typeName}.json`);
      const wzPath = typeName;
      const typeJson = await this.getJson(wzPath);
      let output = typeJson.Construction;
      fs.writeFileSync(savePath, JSON.stringify(output, null, 2));
    }
  }
}

export default ThemeParser;
