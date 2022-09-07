import path from 'path';
import fs from 'fs';

import ParserBase from './base';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, Config.FurnitureWzFile);

function parseImageName(name: string) {
  return name
    .replace(Config.WZ_SOURCE.replace(/^\.\//, '') + '\\', '')
    .replace('Item.wz', 'Item')
    .replace(/\\(\\)?/g, '-');
}

class FurnitureParser extends ParserBase {
  saveRoot: string;
  saveImageRoot: string;
  constructor() {
    super(Config.FurnitureWzFile, wzPath);
    this.saveRoot = path.join(Config.OUTPUT_ROOT, Config.FurnitureOutput);
    this.saveImageRoot = path.join(
      Config.OUTPUT_ROOT,
      'images',
      Config.FurnitureOutput
    );
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    for await (const typeName of Config.FurnitureTypes) {
      const savePath = path.join(this.saveRoot, `${typeName}.json`);
      const wzPath = Config.FurniturePath + '\\' + typeName;
      const typeJson = await this.getJson(wzPath);
      Object.keys(typeJson).forEach((key) => {
        if (typeJson[key] && typeJson[key].info) {
          delete typeJson[key].info.icon;
          delete typeJson[key].info.iconRaw;
        }
        if (!key.startsWith('02671') && !key.startsWith('02672')) {
          delete typeJson[key];
        }
      });
      fs.writeFileSync(savePath, JSON.stringify(typeJson, null, 2));
    }
  }
  async saveImage() {
    for await (const typeName of Config.FurnitureTypes) {
      const wzPath = Config.FurniturePath + '\\' + typeName;
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

export default FurnitureParser;
