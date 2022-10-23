import path from 'path';
import fs from 'fs';

import ParserBase from './base';

import Config from '../../config';

const wzPath = path.join(Config.WZ_SOURCE, Config.ThemeUIWzFile);

function parseImageName(name: string) {
  return name
    .replace(Config.WZ_SOURCE.replace(/^\.\//, '') + '\\', '')
    .replace(Config.ThemeUIWzFile, 'Item-Consume')
    .replace(/\\(\\)?/g, '-');
}

class ThemeUIParser extends ParserBase {
  saveRoot: string;
  saveImageRoot: string;
  constructor() {
    super(Config.ThemeUIWzFile, wzPath);
    this.saveRoot = path.join(Config.OUTPUT_ROOT, Config.ThemeUIOutput);
    this.saveImageRoot = path.join(
      Config.OUTPUT_ROOT,
      'images',
      Config.ThemeUIOutput
    );
  }
  async saveJson() {
    fs.mkdirSync(this.saveRoot, { recursive: true });
    for await (const typeName of Config.ThemeUITypes) {
      const wzPath = Config.ThemeUIPath
        ? `${Config.ThemeUIPath}\\${typeName}`
        : typeName;
      // just trigger image
      const typeJson = await this.getJson(wzPath);
    }
  }
  imageCallback(name: string, bitmap: any) {
    const saveName = parseImageName(name);
    if (!saveName.includes('img-02670')) {
      return;
    }
    bitmap &&
      bitmap.writeAsync &&
      bitmap.writeAsync(path.join(this.saveImageRoot, `${saveName}.png`));
  }
}

export default ThemeUIParser;
