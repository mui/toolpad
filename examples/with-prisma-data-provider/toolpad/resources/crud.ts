/**
 * Toolpad data provider file.
 * See: https://mui.com/toolpad/concepts/data-providers/
 */

import { createDataProvider } from '@mui/toolpad/server';
import prisma from '../prisma';

function parseOperator(operator: string) {
  switch (operator) {
    case '=':
    case 'equals':
      return 'equals';
    case '!=':
      return 'not';
    case '>':
      return 'gt';
    case '>=':
      return 'gte';
    case '<':
      return 'lt';
    case '<=':
      return 'lte';
    case 'isAnyOf':
      return 'in';
    case 'contains':
    case 'isEmpty':
    case 'isNotEmpty':
    case 'startsWith':
    case 'endsWith':
      return operator;
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

function parseValue(typeName: string, value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }
  switch (typeName) {
    case 'Boolean':
      return Boolean(value);
    case 'String':
      return String(value);
    case 'Int':
    case 'BigInt':
    case 'Float':
    case 'Decimal':
      return Number(value);
    default:
      return value;
  }
}

const model: typeof prisma.user | typeof prisma.post = prisma.user;
export default createDataProvider({
  async getRecords({ paginationModel: { start, pageSize }, sortModel, filterModel }) {
    const [userRecords, totalCount] = await Promise.all([
      model.findMany({
        skip: start,
        take: pageSize,

        where:
          filterModel.items.length <= 0
            ? undefined
            : {
                [filterModel.logicOperator.toUpperCase()]: filterModel.items.map(
                  ({ field, operator, value }) => {
                    operator = parseOperator(operator);
                    switch (operator) {
                      case 'isEmpty':
                        return { [field]: null };
                      case 'isNotEmpty':
                        return { [field]: { not: null } };
                      default: {
                        const typeName = (model.fields as any)[field]?.typeName;
                        if (operator === 'in') {
                          value = (value as unknown[]).map((val) => parseValue(typeName, val));
                        } else {
                          value = parseValue(typeName, value);
                        }
                        return { [field]: { [operator]: value } };
                      }
                    }
                  },
                ),
              },

        orderBy: sortModel.map(({ field, sort }) => ({
          [field]: sort,
        })),
      }),
      model.count(),
    ]);
    return {
      records: userRecords,
      totalCount,
    };
  },

  async deleteRecord(id) {
    await model.delete({ where: { id: Number(id) } });
  },

  async updateRecord(id, data) {
    return model.update({ where: { id: Number(id) }, data });
  },

  async createRecord(data) {
    return model.create({ data });
  },
});
