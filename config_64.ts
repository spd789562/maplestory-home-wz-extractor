import { WzMapleVersion } from '@tybys/wz';

export default {
  WZ_SOURCE: './wzSource',
  WZ_VERSION: WzMapleVersion.BMS,
  OUTPUT_ROOT: './output',

  MapOutput: 'map',
  HouseMapWzFile: 'Map\\Map\\Map8\\Map8_000.wz',
  HouseTypePath: '',
  HouseTypes: [
    '871100000.img',
    '871100001.img',
    '871100002.img',
    '871100003.img',
    '871100004.img',
    '871100005.img',
    '871100006.img',
    '871100007.img',
    '871100008.img',
    '871100009.img',
    '871100010.img',
    '871100011.img',
    '871100012.img',
    '871100013.img',
    '871100014.img',
    '871100015.img',
    '871100016.img',
    '871100017.img',
    '871100018.img',
    '871100019.img',
    '871100020.img',
    '871100021.img',
    '871100022.img',
    '871100023.img',
    '871100024.img',
    '871100025.img',
    '871100026.img',
    '871100027.img',
  ],
  MapBackOutput: 'map-back',
  MapBackWzFile: 'Map\\Back\\Back_009.wz',
  MapBackPath: '',
  MapBackTypes: [
    'myHome.img',
    'myHome_lith.img',
    'myHome_night.img',
    'myHome_winter.img',
  ],

  MapObjOutput: 'map-object',
  MapObjWzFile: 'Map\\Obj\\Obj_016.wz',
  MapObjPath: '',
  MapObjTypes: ['myHome.img', 'myHome2.img'],

  FurnitureOutput: 'furniture',
  FurnitureWzFile: 'Item\\Consume\\Consume_000.wz',
  FurniturePath: '',
  FurnitureTypes: ['0267.img'],

  StringOutput: 'furniture-string',
  StringWzFile: 'String_000.wz',
  StringPath: 'Consume',
  StringTypes: ['Consume.img'],

  ThemeOutput: 'map-theme',
  ThemeWzFile: 'Etc\\Etc_003.wz',
  ThemePath: 'Construction',
  ThemeTypes: ['myHome.img'],
} as const;
