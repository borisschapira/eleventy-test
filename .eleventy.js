const { DateTime } = require("luxon");
const fs = require("fs");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const htmlmin = require("html-minifier");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    // Change which syntax highlighters are installed
    templateFormats: ["terminal", "js", "bash"] // default
  });
  eleventyConfig.setDataDeepMerge(true);

  /***********************************************
   * Custom collections with previous/next post  *
   ***********************************************/

  eleventyConfig.addCollection("tagList", require("./_11ty/getTagList"));

  const arrLocales = ["en", "fr"];
  const arrCategories = ["web", "citoyen", "papa"];

  function addPrevNext(collectionArray) {
    const l = collectionArray.length;
    for (let p = 0; p < collectionArray.length; p++) {
      if (p > 1) {
        collectionArray[p].data.previous = {
          title: collectionArray[p - 1].data.title,
          url: collectionArray[p - 1].url
        };
      }
      if (p < l - 1) {
        collectionArray[p].data.next = {
          title: collectionArray[p + 1].data.title,
          url: collectionArray[p + 1].url
        };
      }
    }
    return collectionArray;
  }

  for (let i = 0; i < arrLocales.length; i++) {
    const l = arrLocales[i];
    eleventyConfig.addCollection(`posts_${l}`, collection =>
      collection.getFilteredByTag("posts").filter(function(item) {
        return item.data.locale == l;
      })
    );

    for (let j = 0; j < arrCategories.length; j++) {
      const c = arrCategories[j];
      eleventyConfig.addCollection(`posts_${l}_${c}`, collection =>
        addPrevNext(
          collection.getFilteredByTag("posts").filter(function(item) {
            return item.data.category == c && item.data.locale == l;
          })
        )
      );
    }
  }

  /********************************
   * Filters                      *
   ********************************/

  eleventyConfig.addFilter("readableDate", dateObj =>
    DateTime.fromJSDate(dateObj, { zone: "utc+1" }).toFormat("dd LLL yyyy")
  );

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", dateObj =>
    DateTime.fromJSDate(dateObj, { zone: "utc+1" }).toFormat("yyyy-LL-dd")
  );

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("functions");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("human.txt");

  /********************************
   * Markdown plugins             *
   ********************************/

  const markdownIt = require("markdown-it");
  const markdownItAnchor = require("markdown-it-anchor");
  const options = {
    html: true,
    breaks: true,
    linkify: true
  };
  const opts = {
    permalink: true,
    permalinkClass: "direct-link",
    permalinkSymbol: "#"
  };

  eleventyConfig.setLibrary(
    "md",
    markdownIt(options).use(markdownItAnchor, opts)
  );

  /********************************
   * Transformations              *
   ********************************/

  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if (outputPath.endsWith(".html")) {
      const minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

  /********************************
   * Browsersync config           *
   ********************************/

  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync("_site/404.html");

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      }
    },
    port: 443,
    https: {
      key: "_cert/boris.schapira.local+3-key.pem",
      cert: "_cert/boris.schapira.local+3.pem"
    }
  });

  return {
    templateFormats: ["md", "njk", "html", "liquid"],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: "/",
    passthroughFileCopy: true,
    dir: {
      input: "_content",
      includes: "_includes",
      layouts: "_layouts",
      data: "./_data",
      output: "./_site"
    }
  };
};
