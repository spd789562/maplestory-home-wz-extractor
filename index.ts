import MapParser from './src/parsers/map';
import MapBackParser from './src/parsers/mapBack';
import MapObjParser from './src/parsers/mapObj';
import FurnitureParser from './src/parsers/furniture';

async function job() {
  const mapWz = new MapParser();
  await mapWz.initialize();
  await mapWz.saveJson();

  const mapBackWz = new MapBackParser();
  await mapBackWz.initialize();
  await mapBackWz.saveJson();
  await mapBackWz.saveImage();

  const mapObjWz = new MapObjParser();
  await mapObjWz.initialize();
  await mapObjWz.saveImage();
  await mapObjWz.saveJson();

  const furnitureWz = new FurnitureParser();
  await furnitureWz.initialize();
  await furnitureWz.saveJson();
  await furnitureWz.saveImage();

  mapWz.dispose();
  mapBackWz.dispose();
  mapObjWz.dispose();
  furnitureWz.dispose();

  return true;
}

job();
