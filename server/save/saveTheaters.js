const Theaters = require('../../model/Theaters')

module.exports = async (data) => {
  data.forEach(element => {
    await Theaters.create(element)
  });
}