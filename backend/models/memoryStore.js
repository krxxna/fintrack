const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const users = [];
const transactions = [];

const isMongoReady = () => mongoose.connection.readyState === 1;
const id = () => new mongoose.Types.ObjectId().toString();
const sameId = (a, b) => String(a) === String(b);

class MemoryQuery {
  constructor(run) {
    this.run = run;
    this.transforms = [];
  }

  select() {
    return this;
  }

  sort(sortSpec = {}) {
    this.transforms.push((value) => {
      const rows = [...value];
      const [[key, dir] = []] = Object.entries(sortSpec);
      if (!key) return rows;
      return rows.sort((a, b) => {
        const av = a[key] instanceof Date ? a[key].getTime() : a[key];
        const bv = b[key] instanceof Date ? b[key].getTime() : b[key];
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (dir === 1 ? 1 : -1);
      });
    });
    return this;
  }

  skip(count = 0) {
    this.transforms.push((value) => value.slice(count));
    return this;
  }

  limit(count = 0) {
    this.transforms.push((value) => value.slice(0, count));
    return this;
  }

  async exec() {
    let value = await this.run();
    for (const transform of this.transforms) value = transform(value);
    return value;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }

  finally(done) {
    return this.exec().finally(done);
  }
}

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  currency: user.currency,
  theme: user.theme,
  createdAt: user.createdAt,
});

const makeUserDoc = (user) => ({
  ...user,
  toPublic() {
    return publicUser(user);
  },
  async comparePassword(candidate) {
    return bcrypt.compare(candidate, user.password);
  },
  async save() {
    if (this.password !== user.password) {
      user.password = await bcrypt.hash(this.password, 12);
    }
    user.updatedAt = new Date();
    return makeUserDoc(user);
  },
});

const normalizeUser = (data) => ({
  _id: data._id || id(),
  name: data.name,
  email: String(data.email).toLowerCase().trim(),
  password: data.password,
  currency: data.currency || 'USD',
  theme: data.theme || 'dark',
  isVerified: data.isVerified || false,
  createdAt: data.createdAt || new Date(),
  updatedAt: data.updatedAt || new Date(),
});

const matchesDate = (date, filter) => {
  if (!filter) return true;
  const value = new Date(date).getTime();
  if (filter.$gte && value < new Date(filter.$gte).getTime()) return false;
  if (filter.$lte && value > new Date(filter.$lte).getTime()) return false;
  return true;
};

const matchesRegex = (value, filter) => {
  if (!filter?.$regex) return value === filter;
  return new RegExp(filter.$regex, filter.$options || '').test(value);
};

const matchesTransaction = (txn, filter = {}) => {
  if (filter._id) {
    if (filter._id.$in && !filter._id.$in.some((candidate) => sameId(candidate, txn._id))) return false;
    if (!filter._id.$in && !sameId(filter._id, txn._id)) return false;
  }
  if (filter.userId && !sameId(filter.userId, txn.userId)) return false;
  if (filter.type && txn.type !== filter.type) return false;
  if (filter.category && !matchesRegex(txn.category, filter.category)) return false;
  if (filter.date && !matchesDate(txn.date, filter.date)) return false;
  if (filter.$or) {
    return filter.$or.some((condition) => {
      if (condition.note) return matchesRegex(txn.note, condition.note);
      if (condition.category) return matchesRegex(txn.category, condition.category);
      return false;
    });
  }
  return true;
};

const cloneTxn = (txn) => ({ ...txn, date: new Date(txn.date) });

const memoryUser = {
  findOne(filter = {}) {
    return new MemoryQuery(async () => {
      const user = users.find((item) => item.email === String(filter.email).toLowerCase().trim());
      return user ? makeUserDoc(user) : null;
    });
  },

  findById(userId) {
    return new MemoryQuery(async () => {
      const user = users.find((item) => sameId(item._id, userId));
      return user ? makeUserDoc(user) : null;
    });
  },

  async create(data) {
    const user = normalizeUser(data);
    user.password = await bcrypt.hash(user.password, 12);
    users.push(user);
    return makeUserDoc(user);
  },

  async findByIdAndUpdate(userId, updates = {}) {
    const user = users.find((item) => sameId(item._id, userId));
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: new Date() });
    return makeUserDoc(user);
  },
};

const memoryTransaction = {
  find(filter = {}) {
    return new MemoryQuery(async () => transactions.filter((txn) => matchesTransaction(txn, filter)).map(cloneTxn));
  },

  async countDocuments(filter = {}) {
    return transactions.filter((txn) => matchesTransaction(txn, filter)).length;
  },

  async create(data) {
    const now = new Date();
    const txn = {
      _id: id(),
      userId: String(data.userId),
      amount: Number(data.amount),
      type: data.type,
      category: data.category,
      date: data.date ? new Date(data.date) : now,
      note: data.note || '',
      createdAt: now,
      updatedAt: now,
    };
    transactions.push(txn);
    return cloneTxn(txn);
  },

  async findOne(filter = {}) {
    const txn = transactions.find((item) => matchesTransaction(item, filter));
    return txn ? cloneTxn(txn) : null;
  },

  async findOneAndUpdate(filter = {}, update = {}) {
    const txn = transactions.find((item) => matchesTransaction(item, filter));
    if (!txn) return null;
    const changes = update.$set || update;
    Object.assign(txn, changes, {
      amount: changes.amount !== undefined ? Number(changes.amount) : txn.amount,
      date: changes.date !== undefined ? new Date(changes.date) : txn.date,
      updatedAt: new Date(),
    });
    return cloneTxn(txn);
  },

  async findOneAndDelete(filter = {}) {
    const index = transactions.findIndex((item) => matchesTransaction(item, filter));
    if (index < 0) return null;
    const [txn] = transactions.splice(index, 1);
    return cloneTxn(txn);
  },

  async deleteMany(filter = {}) {
    const before = transactions.length;
    for (let i = transactions.length - 1; i >= 0; i--) {
      if (matchesTransaction(transactions[i], filter)) transactions.splice(i, 1);
    }
    return { deletedCount: before - transactions.length };
  },

  async aggregate(pipeline = []) {
    const match = pipeline.find((stage) => stage.$match)?.$match || {};
    const group = pipeline.find((stage) => stage.$group)?.$group;
    const rows = transactions.filter((txn) => matchesTransaction(txn, match));
    if (!group) return rows.map(cloneTxn);

    const buckets = new Map();
    rows.forEach((txn) => {
      let key;
      if (group._id === '$type') key = txn.type;
      else if (group._id === '$category') key = txn.category;
      else if (group._id?.month && group._id?.type) key = JSON.stringify({ month: txn.date.getMonth() + 1, type: txn.type });
      else if (group._id?.day && group._id?.type) key = JSON.stringify({ day: txn.date.getDate(), type: txn.type });
      else key = 'all';

      const bucket = buckets.get(key) || {
        _id: key.startsWith('{') ? JSON.parse(key) : key,
        total: 0,
        count: 0,
        min: Infinity,
        max: -Infinity,
      };
      bucket.total += txn.amount;
      bucket.count += 1;
      bucket.min = Math.min(bucket.min, txn.amount);
      bucket.max = Math.max(bucket.max, txn.amount);
      bucket.avg = bucket.total / bucket.count;
      buckets.set(key, bucket);
    });

    const result = [...buckets.values()];
    const sort = pipeline.find((stage) => stage.$sort)?.$sort;
    if (sort) {
      const [[key, dir] = []] = Object.entries(sort);
      result.sort((a, b) => {
        const path = key.split('.');
        const av = path.reduce((value, part) => value?.[part], a);
        const bv = path.reduce((value, part) => value?.[part], b);
        return (av === bv ? 0 : av > bv ? 1 : -1) * (dir === 1 ? 1 : -1);
      });
    }
    return result;
  },
};

module.exports = {
  isMongoReady,
  memoryUser,
  memoryTransaction,
};
