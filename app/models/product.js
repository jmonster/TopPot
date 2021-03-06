import DS from 'ember-data';

// !! IMPORTANT !!
// https://github.com/firebase/emberfire/blob/master/docs/guide/relationships.md#relationships
//
// Unless have a reason and understand the implications
// we suggest using inverse: null in your relationships
// and saving both sides manually
// due to the nature of the Real-time Database.

const inverse = null;

export default DS.Model.extend({
  reviews: DS.hasMany('review', { inverse }), // user authored reviews
  pictures: DS.hasMany('picture', { inverse }),
  brand: DS.belongsTo('brand', { inverse }),   // { name: "Jetty", ... }
  name: DS.attr('string'),        // e.g. "Sunset Sherbert"
  description: DS.attr('string'), // markdown text field
  price: DS.attr('number'),

  editRoute: 'cms.admin.products.edit',
  viewRoute: 'cms.admin.products.edit',
  icon: '❀'
});
