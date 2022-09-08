import path from 'path';
import fs from 'fs';

import ParserBase from './base';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, Config.FurnitureWzFile);

function parseImageName(name: string) {
  return name
    .replace(Config.WZ_SOURCE.replace(/^\.\//, '') + '\\', '')
    .replace(Config.FurnitureWzFile, 'Item-Consume')
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
      const wzPath = Config.FurniturePath
        ? `${Config.FurniturePath}\\${typeName}`
        : typeName;
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
  imageCallback(name: string, bitmap: any) {
    const saveName = parseImageName(name);
    if (
      (!saveName.includes('img-02671') && !saveName.includes('img-02672')) ||
      saveName.includes('-info-iconRaw')
    ) {
      return;
    }
    bitmap &&
      bitmap.writeAsync &&
      bitmap.writeAsync(path.join(this.saveImageRoot, `${saveName}.png`));
  }
}

export default FurnitureParser;
