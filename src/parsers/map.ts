import path from 'path';
import fs from 'fs';

import ParserBase from './base';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, Config.HouseMapWzFile);

class MapParser extends ParserBase {
  saveRoot: string;
  constructor() {
    super(Config.HouseMapWzFile, wzPath);
    this.saveRoot = path.join(Config.OUTPUT_ROOT, Config.MapOutput);
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    for await (const typeName of Config.HouseTypes) {
      const savePath = path.join(this.saveRoot, `${typeName}.json`);
      const wzPath = Config.HouseTypePath + '\\' + typeName;
      const typeJson = await this.getJson(wzPath);
      fs.writeFileSync(savePath, JSON.stringify(typeJson, null, 2));
    }
  }
}

export default MapParser;
