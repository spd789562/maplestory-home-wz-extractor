import MapParser from './src/parsers/map';
import MapBackParser from './src/parsers/mapBack';
import MapObjParser from './src/parsers/mapObj';
import FurnitureParser from './src/parsers/furniture';
import ThemeUIParser from './src/parsers/themeui';
import StringParser from './src/parsers/string';
import ThemeParser from './src/parsers/theme';

// import TestParser from './src/parsers/test';

async function job() {
  const mapWz = new MapParser();
  await mapWz.initialize();
  await mapWz.saveJson();
  mapWz.dispose();

  const mapBackWz = new MapBackParser();
  await mapBackWz.initialize();
  await mapBackWz.saveJson();
  mapBackWz.dispose();

  const mapObjWz = new MapObjParser(1);
  await mapObjWz.initialize();
  await mapObjWz.saveJson();
  mapObjWz.dispose();

  const map2ObjWz = new MapObjParser(2);
  await map2ObjWz.initialize();
  await map2ObjWz.saveJson();
  map2ObjWz.dispose();

  const furnitureWz = new FurnitureParser();
  await furnitureWz.initialize();
  await furnitureWz.saveJson();
  furnitureWz.dispose();

  const themeUIWz = new ThemeUIParser();
  await themeUIWz.initialize();
  await themeUIWz.saveJson();
  themeUIWz.dispose();

  const stringWz = new StringParser();
  await stringWz.initialize();
  await stringWz.saveJson();
  stringWz.dispose();

  const themeWz = new ThemeParser();
  await themeWz.initialize();
  await themeWz.saveJson();
  themeWz.dispose();

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
