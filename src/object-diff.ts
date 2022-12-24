import {
  ObjectData,
  ObjectDiff,
  DiffStatus,
  STATUS,
  Subproperties,
} from "./model";
import { isObject, isEqual } from "./utils";

function getObjectStatus(diff: ObjectDiff["diff"]): DiffStatus {
  return diff.some((property) => property.status !== STATUS.EQUAL)
    ? STATUS.UPDATED
    : STATUS.EQUAL;
}

function formatSingleObjectDiff(
  data: ObjectData,
  status: DiffStatus
): ObjectDiff {
  if (!data) {
    return {
      type: "object",
      status: STATUS.isEqual,
      diff: [],
    };
  }
  const diff: ObjectDiff["diff"] = [];
  Object.entries(data).forEach(([property, value]) => {
    if (isObject(value)) {
      const subPropertiesDiff: Subproperties[] = [];
      Object.entries(value).forEach(([subProperty, subValue]) => {
        subPropertiesDiff.push({
          name: subProperty,
          previousValue: status === STATUS.ADDED ? undefined : subValue,
          currentValue: status === STATUS.ADDED ? subValue : undefined,
          status,
        });
      });
      return diff.push({
        property: property,
        previousValue: status === STATUS.ADDED ? undefined : data[property],
        currentValue: status === STATUS.ADDED ? value : undefined,
        status,
        subPropertiesDiff,
      });
    }
    return diff.push({
      property,
      previousValue: status === STATUS.ADDED ? undefined : data[property],
      currentValue: status === STATUS.ADDED ? value : undefined,
      status,
    });
  });
  return {
    type: "object",
    status,
    diff,
  };
}

function getPreviousMatch(
  previousValue: any | undefined,
  nextSubProperty: any
): any | undefined {
  if (!previousValue) {
    return undefined;
  }
  const previousMatch = Object.entries(previousValue).find(([subPreviousKey]) =>
    isEqual(subPreviousKey, nextSubProperty)
  );
  return previousMatch ? previousMatch[1] : undefined;
}

function getValueStatus(previousValue: any, nextValue: any): DiffStatus {
  if (isEqual(previousValue, nextValue)) {
    return STATUS.EQUAL;
  }
  return STATUS.UPDATED;
}

function getPropertyStatus(subPropertiesDiff: Subproperties[]): DiffStatus {
  return subPropertiesDiff.some((property) => property.status !== STATUS.EQUAL)
    ? STATUS.UPDATED
    : STATUS.EQUAL;
}

function getDeletedMainProperties(
  previousValue: Record<string, any>,
  nextValue: Record<string, any>
): { property: string; value: any }[] | undefined {
  const prevKeys = Object.keys(previousValue);
  const nextKeys = Object.keys(nextValue);
  const deletedKeys = prevKeys.filter((prevKey) => !nextKeys.includes(prevKey));
  if (deletedKeys.length > 0) {
    return deletedKeys.map((deletedKey) => ({
      property: deletedKey,
      value: previousValue[deletedKey],
    }));
  }
  return undefined;
}

function getDeletedSubProperties(
  previousValue: any,
  nextValue: any,
  nextProperty: string
): { property: string; value: any }[] | undefined {
  if (!previousValue) return undefined;
  const previousMatch = previousValue[nextProperty];
  if (!previousMatch) return undefined;
  const nextMatch = nextValue[nextProperty];
  const nextKeys = isObject(nextMatch) ? Object.keys(nextMatch) : [];
  const prevKeys = isObject(previousMatch) ? Object.keys(previousMatch) : [];
  const deletedKeys = prevKeys.filter(
    (previousKey) => !nextKeys.includes(previousKey)
  );
  const result = deletedKeys.map((deletedKey) => ({
    property: deletedKey,
    value: previousMatch[deletedKey],
  }));
  if (result.length > 0) return result;
  return undefined;
}

function getSubPropertiesDiff(
  previousValue: Record<string, any> | undefined,
  nextValue: Record<string, any>
): Subproperties[] {
  const subPropertiesDiff: Subproperties[] = [];
  let subDiff: Subproperties[];
  Object.entries(nextValue).forEach(([nextSubProperty, nextSubValue]) => {
    const previousMatch = getPreviousMatch(previousValue, nextSubProperty);
    if (!!!previousMatch && !!nextSubProperty) {
      return subPropertiesDiff.push({
        name: nextSubProperty,
        previousValue: undefined,
        currentValue: nextSubValue,
        status: STATUS.ADDED,
      });
    }
    if (isObject(nextSubValue)) {
      const data: Subproperties[] = getSubPropertiesDiff(
        previousMatch,
        nextSubValue
      );
      if (data && data.length > 0) {
        subDiff = data;
      }
      const deletedProperties = getDeletedSubProperties(
        previousValue,
        nextValue,
        nextSubProperty
      );
      if (deletedProperties) {
        deletedProperties.forEach((deletedProperty) => {
          const deletedData = {
            name: deletedProperty.property,
            previousValue: deletedProperty.value,
            currentValue: undefined,
            status: STATUS.DELETED,
          };
          if (subDiff) {
            subDiff.push(deletedData);
          } else {
            subDiff = [deletedData];
          }
        });
      }
    }
    if (previousMatch) {
      subPropertiesDiff.push({
        name: nextSubProperty,
        previousValue: previousMatch,
        currentValue: nextSubValue,
        status: getValueStatus(previousMatch, nextSubValue),
        ...(!!subDiff && { subDiff }),
      });
    }
  });
  return subPropertiesDiff;
}

export function getObjectDiff(
  prevData: ObjectData,
  nextData: ObjectData
): ObjectDiff {
  if (!prevData && !nextData) {
    return {
      type: "object",
      status: STATUS.EQUAL,
      diff: [],
    };
  }
  if (!prevData) {
    return formatSingleObjectDiff(nextData, STATUS.ADDED);
  }
  if (!nextData) {
    return formatSingleObjectDiff(prevData, STATUS.DELETED);
  }
  const diff: ObjectDiff["diff"] = [];
  Object.entries(nextData).forEach(([nextProperty, nextValue]) => {
    const previousValue = prevData[nextProperty];
    if (!!!previousValue) {
      return diff.push({
        property: nextProperty,
        previousValue: undefined,
        currentValue: nextValue,
        status: STATUS.ADDED,
      });
    }
    if (isObject(nextValue)) {
      const subPropertiesDiff: Subproperties[] = getSubPropertiesDiff(
        previousValue,
        nextValue
      );
      return diff.push({
        property: nextProperty,
        previousValue,
        currentValue: nextValue,
        status: getPropertyStatus(subPropertiesDiff),
        subPropertiesDiff,
      });
    }
    return diff.push({
      property: nextProperty,
      previousValue,
      currentValue: nextValue,
      status: getValueStatus(previousValue, nextValue),
    });
  });
  const deletedProperties = getDeletedMainProperties(prevData, nextData);
  if (deletedProperties) {
    deletedProperties.forEach((deletedProperty) => {
      diff.push({
        property: deletedProperty.property,
        previousValue: deletedProperty.value,
        currentValue: undefined,
        status: STATUS.DELETED,
      });
    });
  }
  return {
    type: "object",
    status: getObjectStatus(diff),
    diff,
  };
}
