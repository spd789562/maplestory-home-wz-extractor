import {
  WzObject,
  WzDirectory,
  WzImage,
  WzObjectType,
  WzPropertyType,
  WzImageProperty,
  WzCanvasProperty,
  WzConvexProperty,
  WzVectorProperty,
  WzNullProperty,
  WzUOLProperty,
  WzLuaProperty,
  WzPngProperty,
  WzStringProperty,
  WzIntProperty,
  WzShortProperty,
  WzLongProperty,
  WzDoubleProperty,
  WzFloatProperty,
  WzSubProperty,
  Canvas,
} from '@tybys/wz';

export function isDirectory(obj: WzObject): obj is WzDirectory {
  return obj.objectType === WzObjectType.Directory;
}

export function isWzImage(obj: WzObject): obj is WzImage {
  return obj.objectType === WzObjectType.Image;
}

export function isProperty(obj: WzObject): obj is WzImageProperty {
  return obj.objectType === WzObjectType.Property;
}

export function isCanvasProperty(
  obj: WzImageProperty,
): obj is WzCanvasProperty {
  return obj.propertyType === WzPropertyType.Canvas;
}

export function isShortProperty(obj: WzImageProperty): obj is WzShortProperty {
  return obj.propertyType === WzPropertyType.Short;
}

export function isIntProperty(obj: WzImageProperty): obj is WzIntProperty {
  return obj.propertyType === WzPropertyType.Int;
}

export function isLongProperty(obj: WzImageProperty): obj is WzLongProperty {
  return obj.propertyType === WzPropertyType.Long;
}

export function isFloatProperty(obj: WzImageProperty): obj is WzFloatProperty {
  return obj.propertyType === WzPropertyType.Float;
}

export function isDoubleProperty(
  obj: WzImageProperty,
): obj is WzDoubleProperty {
  return obj.propertyType === WzPropertyType.Double;
}

export function isStringProperty(
  obj: WzImageProperty,
): obj is WzStringProperty {
  return obj.propertyType === WzPropertyType.String;
}

export function isSubProperty(obj: WzImageProperty): obj is WzSubProperty {
  return obj.propertyType === WzPropertyType.SubProperty;
}

export function isVectorProperty(
  obj: WzImageProperty,
): obj is WzVectorProperty {
  return obj.propertyType === WzPropertyType.Vector;
}

export function isConvexProperty(
  obj: WzImageProperty,
): obj is WzConvexProperty {
  return obj.propertyType === WzPropertyType.Convex;
}

export function isUOLProperty(obj: WzImageProperty): obj is WzUOLProperty {
  return obj.propertyType === WzPropertyType.UOL;
}

export function isLuaProperty(obj: WzImageProperty): obj is WzLuaProperty {
  return obj.propertyType === WzPropertyType.Lua;
}

export function isPngProperty(obj: WzImageProperty): obj is WzPngProperty {
  return obj.propertyType === WzPropertyType.PNG;
}

export function isNullProperty(obj: WzImageProperty): obj is WzNullProperty {
  return obj.propertyType === WzPropertyType.Null;
}

export function isCanvas(obj: Canvas | WzCanvasProperty): obj is Canvas {
  return obj instanceof Canvas;
}
