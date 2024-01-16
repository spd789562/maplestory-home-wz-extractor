import path from 'path';
import fs from 'fs';

import ParserBase from './base';
import type { default as WzDataTree } from '../modules/WzDataTree';

import Config from '../../config';
import { JSONValue } from '../util/JsonTree';

const wzPath = path.join(Config.WZ_SOURCE, Config.ThemeWzFile);

class ThemeParser extends ParserBase {
  saveRoot: string;
  constructor(wzData: WzDataTree) {
    super(Config.ThemeWzFile, wzPath, wzData);
    this.saveRoot = path.join(Config.OUTPUT_ROOT, Config.ThemeOutput);
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    for await (const typeName of Config.ThemeTypes) {
      const savePath = path.join(this.saveRoot, `${typeName}.json`);
      const wzPath = typeName;
      const typeJson = (await this.getJson(wzPath)) as unknown as {
        Construction: JSONValue;
      };
      const output = typeJson.Construction;
      fs.writeFileSync(savePath, JSON.stringify(output, null, 2));
    }
  }
}

export default ThemeParser;
