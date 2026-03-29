import { apiError } from '../../../utils/apiError.js';

export default {
  create: async () => { throw new apiError(400, 'Peripheral itemType is not supported yet. Please add peripheral handler in Backend/src/assets/handlers/peripheral/peripheral.handler.js.'); },
  list: async () => ({ items: [], message: 'Peripheral list is not supported yet.' }),
  getById: async () => { throw new apiError(400, 'Peripheral details is not supported yet.'); },
};
