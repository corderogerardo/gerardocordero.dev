function Jar() {
  // TODO
  this.juice = {
    apple: 0,
  };
  this.amount = 0;
  this.concentration = {
    apple: 0,
  };
}

Jar.prototype.add = function (amount, type) {
  // TODO
  this.juice[type] = this.juice[type] ? this.juice[type] + amount : amount;
  this.amount += amount;
  let juice = Object.keys(this.juice);
  if (this.concentration[type]) {
    this.concentration[type] = 0;
  }
  juice.map((value) => {
    this.concentration[value] =
      juice.length > 1 && this.juice[value] > 0
        ? (this.juice[value] / this.amount) * 1
        : 1;
  });
};

Jar.prototype.pourOut = function (amount) {
  let juice = Object.keys(this.juice);

  if (this.amount === amount) {
    this.amount -= amount;
    juice.map((value) => {
      this.concentration[value] = 0;
      this.juice[value] = 0;
    });
  } else if (amount < this.amount) {
    juice.map((value) => {
      let restValue = this.juice[value] - Math.round(amount / juice.length);
      this.juice[value] = restValue < 1 ? 0 : this.juice[value] - restValue;
    });
    this.amount -= amount;
  }
};

Jar.prototype.getTotalAmount = function () {
  return this.amount;
};

Jar.prototype.getConcentration = function (type) {
  return this.concentration[type] ? this.concentration[type] : 0;
};

// Solution I liked
function Jar() {
  this.amounts = {};
  this.total = 0;
}

Jar.prototype.add = function (amount, type) {
  if (this.amounts[type] == null) this.amounts[type] = 0;
  this.amounts[type] += amount;
  this.total += amount;
};

Jar.prototype.pourOut = function (amount) {
  for (var v in this.amounts)
    this.amounts[v] -= amount * this.getConcentration(v);
  this.total -= amount;
};

Jar.prototype.getTotalAmount = function () {
  return this.total;
};

Jar.prototype.getConcentration = function (type) {
  var conc = this.amounts[type] / this.total;
  return conc > 0 ? conc : 0;
};
