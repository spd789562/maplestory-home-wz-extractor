import path from 'path';
import fs from 'fs';
import type { Canvas } from '@tybys/wz';

import ParserBase from './base';
import type { default as WzDataTree } from '../modules/WzDataTree';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, Config.FurnitureWzFile);

function parseImageName(name: string) {
  return name
    .replace(`${Config.WZ_SOURCE.replace(/^\.\//, '')}\\`, '')
    .replace(Config.FurnitureWzFile, 'Item-Consume')
    .replace(/\\(\\)?/g, '-');
}

class FurnitureParser extends ParserBase {
  saveRoot: string;
  saveImageRoot: string;
  themeUISaveImageRoot: string;
  constructor(wzData: WzDataTree) {
    super(Config.FurnitureWzFile, wzPath, wzData);
    this.saveRoot = path.join(Config.OUTPUT_ROOT, Config.FurnitureOutput);
    this.saveImageRoot = path.join(
      Config.OUTPUT_ROOT,
      'images',
      Config.FurnitureOutput,
    );
    this.themeUISaveImageRoot = path.join(
      Config.OUTPUT_ROOT,
      'images',
      Config.ThemeUIOutput,
    );
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    for await (const typeName of Config.FurnitureTypes) {
      const savePath = path.join(this.saveRoot, `${typeName}.json`);
      const wzPath = Config.FurniturePath
        ? `${Config.FurniturePath}\\${typeName}`
        : typeName;
      const typeJson = (await this.getJson(wzPath)) as unknown as any;
      for (const key in typeJson) {
        if (typeJson[key]?.info) {
          delete typeJson[key].info.icon;
          delete typeJson[key].info.iconRaw;
        }
        // only keep 02671(floor furniture) and 02672(wall furniture)
        if (!key.startsWith('02671') && !key.startsWith('02672')) {
          delete typeJson[key];
        }
      }
      fs.writeFileSync(savePath, JSON.stringify(typeJson, null, 2));
    }
  }
  imageCallback(name: string, bitmap: Canvas) {
    const saveName = parseImageName(name);
    if (saveName.includes('img-02670')) {
      bitmap?.writeAsync?.(path.join(this.themeUISaveImageRoot, `${saveName}.png`));
      return;
    }
    if (
      (!saveName.includes('img-02671') && !saveName.includes('img-02672')) ||
      saveName.includes('-info-iconRaw')
    ) {
      return;
    }
    bitmap?.writeAsync?.(path.join(this.saveImageRoot, `${saveName}.png`));
  }
}

export default FurnitureParser;
