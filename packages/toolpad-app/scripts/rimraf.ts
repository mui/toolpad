import rimrafCb from 'rimraf';
import { promisify } from 'util';

export default promisify(rimrafCb);
