# Tagalong • [TodoMVC](http://todomvc.com)

[Tagalong](https://github.com/shawnbot/tagalong/) is a templating tool
that roughly equates to the "view" in a traditional MVC architecture.
For this demo, the HTML serves purely as a template for dynamic data
loaded at runtime. But, unlike tools such as Handlebars and React,
tagalong can be used to progressively enhance static HTML documents
using special [HTML attributes][attributes].

## Resources

- [Website](https://shawnbot.github.io/tagalong/)
- [Documentation](https://github.com/shawnbot/tagalong/#readme)

### Support

- [GitHub](https://github.com/shawnbot/tagalong/issues)
- [Twitter](http://twitter.com/shawnbot)

## Implementation

This app is a bit different from most other TodoMVC implementations
in that all of the view logic lives in [the HTML](index.html). The "model"
and "view" components of the MVC structure exist as two objects: the data
and [rendering][api] context, respectively, in tagalong parlance.

## Credit

Created by [Shawn Allen](https://github.com/shawnbot/)

[attributes]: https://github.com/shawnbot/tagalong/#attributes
[api]: https://github.com/shawnbot/tagalong/#api
