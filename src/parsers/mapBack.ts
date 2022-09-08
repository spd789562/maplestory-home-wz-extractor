import path from 'path';
import fs from 'fs';

import ParserBase from './base';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, Config.MapBackWzFile);

function parseImageName(name: string) {
  return name
    .replace(Config.WZ_SOURCE.replace(/^\.\//, '') + '\\', '')
    .replace(Config.MapBackWzFile, 'Map2-Back')
    .replace(/\\(\\)?/g, '-');
}

class MapBackParser extends ParserBase {
  saveRoot: string;
  saveImageRoot: string;
  constructor() {
    super(Config.MapBackWzFile, wzPath);
    this.saveRoot = path.join(Config.OUTPUT_ROOT, Config.MapBackOutput);
    this.saveImageRoot = path.join(
      Config.OUTPUT_ROOT,
      'images',
      Config.MapBackOutput
    );
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    for await (const typeName of Config.MapBackTypes) {
      const savePath = path.join(this.saveRoot, `${typeName}.json`);
      const wzPath = Config.MapBackPath
        ? `${Config.MapBackPath}\\${typeName}`
        : typeName;
      const typeJson = await this.getJson(wzPath);
      delete typeJson.Back;
      fs.writeFileSync(savePath, JSON.stringify(typeJson, null, 2));
    }
  }
  imageCallback(name: string, bitmap: any) {
    bitmap &&
      bitmap.writeAsync &&
      bitmap.writeAsync(
        path.join(this.saveImageRoot, `${parseImageName(name)}.png`)
      );
  }
}

export default MapBackParser;
