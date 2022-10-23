import path from 'path';
import fs from 'fs';

import ParserBase from './base';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, Config.MapObjWzFile);
const wz2Path = path.join(Config.WZ_SOURCE, Config.Map2ObjWzFile);

function parseImageName(name: string, file: string) {
  return name
    .replace(Config.WZ_SOURCE.replace(/^\.\//, '') + '\\', '')
    .replace(file, 'Map2-Obj')
    .replace(/\\(\\)?/g, '-');
}

const ignoreList = ['direction', 'kennethHouse', 'jeffreyHouse', 'construct'];

class MapObjParser extends ParserBase {
  saveRoot: string;
  saveImageRoot: string;
  file: string;
  objTypes: any;
  constructor(type = 1) {
    super(Config.MapObjWzFile, type === 1 ? wzPath : wz2Path);
    this.file = type === 1 ? Config.MapObjWzFile : Config.Map2ObjWzFile;
    this.objTypes = type === 1 ? Config.MapObjTypes : Config.Map2ObjTypes;
    this.saveRoot = path.join(Config.OUTPUT_ROOT, Config.MapObjOutput);
    this.saveImageRoot = path.join(
      Config.OUTPUT_ROOT,
      'images',
      Config.MapObjOutput
    );
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    for await (const typeName of this.objTypes) {
      const savePath = path.join(this.saveRoot, `${typeName}.json`);
      const wzPath = Config.MapObjPath
        ? `${Config.MapObjPath}\\${typeName}`
        : typeName;
      const typeJson = await this.getJson(wzPath);
      delete typeJson.Obj;
      delete typeJson.direction;
      // delete typeJson.Plaza;
      delete typeJson.kennethHouse;
      delete typeJson.jeffreyHouse;
      delete typeJson.construct;
      fs.writeFileSync(savePath, JSON.stringify(typeJson, null, 2));
    }
  }
  imageCallback(name: string, bitmap: any) {
    const saveName = parseImageName(name, this.file);
    if (ignoreList.some((item) => saveName.includes(`.img-${item}`))) {
      return;
    }
    bitmap &&
      bitmap.writeAsync &&
      bitmap.writeAsync(path.join(this.saveImageRoot, `${saveName}.png`));
  }
}

export default MapObjParser;
