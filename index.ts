import MapParser from './src/parsers/map';
import MapBackParser from './src/parsers/mapBack';
import MapObjParser from './src/parsers/mapObj';
import FurnitureParser from './src/parsers/furniture';
import ThemeUIParser from './src/parsers/themeui';
import StringParser from './src/parsers/string';
import ThemeParser from './src/parsers/theme';
import TestParser from './src/parsers/test';

import WzDataTree from './src/modules/WzDataTree';

import Config from './config';

async function job() {
  using WzData = new WzDataTree(Config.WZ_SOURCE, Config.WZ_VERSION);
  await WzData.initialize();

  // {
  //   using mapWz = new MapParser(WzData);
  //   await mapWz.initialize();
  //   await mapWz.saveJson();
  // }

  // {
  //   using mapBackWz = new MapBackParser(WzData);
  //   await mapBackWz.initialize();
  //   await mapBackWz.saveJson();
  // }

  // {
  //   using mapObjWz = new MapObjParser(WzData);
  //   await mapObjWz.initialize();
  //   await mapObjWz.saveJson();
  // }

  // {
  //   using furnitureWz = new FurnitureParser(WzData);
  //   await furnitureWz.initialize();
  //   await furnitureWz.saveJson();
  // }

  {
    using stringWz = new StringParser(WzData);
    await stringWz.initialize();
    await stringWz.saveJson();
  }

  // {
  //   using themeWz = new ThemeParser(WzData);
  //   await themeWz.initialize();
  //   await themeWz.saveJson();
  // }

  return true;
}

// async function test() {
//   const testWz = new TestParser();
//   await testWz.initialize();
//   await testWz.saveJson();
//   testWz.dispose();
// }
// test();
job();
