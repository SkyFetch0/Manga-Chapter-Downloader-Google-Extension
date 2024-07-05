// content.js

function getImageLinks() {
  var imageLinks = [];
  var readingContentDivs = document.querySelectorAll(".reading-content");

  readingContentDivs.forEach(function(div) {
    var images = div.getElementsByTagName("img");
    for (var i = 0; i < images.length; i++) {
      imageLinks.push(images[i].src);
    }
  });

  return imageLinks;
}
function getImageLinksFromScript() {
  var imageLinks = [];
  var scripts = document.getElementsByTagName('script');

  for (var i = 0; i < scripts.length; i++) {
    var script = scripts[i];
    if (script.textContent.includes('ts_reader.run')) {
      var scriptContent = script.textContent;

      var startIndex = scriptContent.indexOf('{');
      var endIndex = scriptContent.lastIndexOf('}');
      var jsonString = scriptContent.substring(startIndex, endIndex + 1);

      try {
        var jsonData = JSON.parse(jsonString);
        if (jsonData && jsonData.sources && jsonData.sources.length > 0) {
          var images = jsonData.sources[0].images;
          if (images && images.length > 0) {
            imageLinks = images;
            break; 
          }
        }
      } catch (error) {
        console.error('Error parsing JSON from script content:', error);
      }
    }
  }

  return imageLinks;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "findTitle") {
    var type = request.type;
    if (type === "madara") {
      var imageLinks = getImageLinks();
      sendResponse({ imageLinks: imageLinks });
    } else if(type === "mangastream") {
      var imageLinks = getImageLinksFromScript();
      sendResponse({ imageLinks: imageLinks });
    } else {
      sendResponse({ error: "Unsupported type" });
    }
  }
});
