import path from 'path';
import fs from 'fs';

import ParserBase from './base';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, Config.MapObjWzFile);

function parseImageName(name: string) {
  return name
    .replace(Config.WZ_SOURCE.replace(/^\.\//, '') + '\\', '')
    .replace('Map2.wz', 'Map2')
    .replace(/\\(\\)?/g, '-');
}

class MapObjParser extends ParserBase {
  saveRoot: string;
  saveImageRoot: string;
  constructor() {
    super(Config.MapObjWzFile, wzPath);
    this.saveRoot = path.join(Config.OUTPUT_ROOT, Config.MapObjOutput);
    this.saveImageRoot = path.join(
      Config.OUTPUT_ROOT,
      'images',
      Config.MapObjOutput
    );
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    for await (const typeName of Config.MapObjTypes) {
      const savePath = path.join(this.saveRoot, `${typeName}.json`);
      const wzPath = Config.MapObjPath + '\\' + typeName;
      const typeJson = await this.getJson(wzPath);
      delete typeJson.Obj;
      delete typeJson.direction;
      delete typeJson.Plaza;
      delete typeJson.kennethHouse;
      delete typeJson.jeffreyHouse;
      delete typeJson.construct;
      fs.writeFileSync(savePath, JSON.stringify(typeJson, null, 2));
    }
  }
  async saveImage() {
    for await (const typeName of Config.MapObjTypes) {
      const wzPath = Config.MapObjPath + '\\' + typeName;
      await this.getImages(wzPath, (name: any, bitmap: any) => {
        bitmap &&
          bitmap.writeAsync &&
          bitmap.writeAsync(
            path.join(this.saveImageRoot, `${parseImageName(name)}.png`)
          );
      });
    }
  }
}

export default MapObjParser;
