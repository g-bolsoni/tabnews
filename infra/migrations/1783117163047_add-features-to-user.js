
exports.up = (pgm) => {
  pgm.addColumn('users', {
    features: {
      type: 'varchar[]',
      notNull: true,
      default: "{}"
    }
  })
};


exports.down = (pgm) => {
  pgm.dropColumn('users', 'features');
};
