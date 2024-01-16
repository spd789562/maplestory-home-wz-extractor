import path from 'path';
import fs from 'fs';
import { Canvas } from '@tybys/wz';

import ParserBase from './base';
import type { default as WzDataTree } from '../modules/WzDataTree';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, Config.MapObjWzFile);

function parseImageName(name: string, file: string) {
  return name
    .replace(`${Config.WZ_SOURCE.replace(/^\.\//, '')}\\`, '')
    .replace(file, 'Map2-Obj')
    .replace(/\\(\\)?/g, '-');
}

const ignoreList = ['direction', 'kennethHouse', 'jeffreyHouse', 'construct'];

class MapObjParser extends ParserBase {
  saveRoot: string;
  saveImageRoot: string;
  file: string;
  objTypes: any;
  constructor(wzData: WzDataTree) {
    super(Config.MapObjWzFile, wzPath, wzData);
    this.file = Config.MapObjWzFile;
    this.objTypes = Config.MapObjTypes;
    this.saveRoot = path.join(Config.OUTPUT_ROOT, Config.MapObjOutput);
    this.saveImageRoot = path.join(
      Config.OUTPUT_ROOT,
      'images',
      Config.MapObjOutput,
    );
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    for await (const typeName of this.objTypes) {
      const savePath = path.join(this.saveRoot, `${typeName}.json`);
      const wzPath = Config.MapObjPath
        ? `${Config.MapObjPath}\\${typeName}`
        : typeName;
      const typeJson = (await this.getJson(wzPath)) as unknown as any;
      delete typeJson.Obj;
      delete typeJson.direction;
      // delete typeJson.Plaza;
      delete typeJson.kennethHouse;
      delete typeJson.jeffreyHouse;
      delete typeJson.construct;
      fs.writeFileSync(savePath, JSON.stringify(typeJson, null, 2));
    }
  }
  imageCallback(name: string, bitmap: Canvas) {
    const saveName = parseImageName(name, this.file);
    if (ignoreList.some((item) => saveName.includes(`.img-${item}`))) {
      return;
    }
    bitmap?.writeAsync?.(path.join(this.saveImageRoot, `${saveName}.png`));
  }
}

export default MapObjParser;
