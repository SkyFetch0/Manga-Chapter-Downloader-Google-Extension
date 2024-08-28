// content.js

function getImageLinks() {
  var imageLinks = [];
  var readingContentDivs = document.querySelectorAll(".wt_viewer");

  readingContentDivs.forEach(function(div) {
    var images = div.getElementsByTagName("img");
    for (var i = 0; i < images.length; i++) {
      imageLinks.push(images[i].src);
    }
  });

  return imageLinks;
}
function get_asuracomics() {
  var imageLinks = [];
  var readingContentDivs = document.querySelectorAll("div.py-8.-mx-5.md\\:mx-0.flex.flex-col.items-center.justify-center");

  readingContentDivs.forEach(function(div) {
    var images = div.getElementsByTagName("img");
    for (var i = 0; i < images.length; i++) {
      imageLinks.push(images[i].src);
    }
  });

  return imageLinks;
}
function get_reaper() {
  var imageLinks = [];
  
  // Tüm .container sınıfına sahip div'leri seç
  var containers = document.querySelectorAll(".container");
  
  containers.forEach(function(container) {
    // .container div'leri içindeki tüm flex, flex-col, justify-center ve items-center sınıflarına sahip div'leri seç
    var targetDivs = container.querySelectorAll("div.flex.flex-col.justify-center.items-center");
    
    targetDivs.forEach(function(targetDiv) {
      // Bu div içindeki tüm img etiketlerini seç
      var images = targetDiv.getElementsByTagName("img");
      
      for (var i = 0; i < images.length; i++) {
        imageLinks.push(images[i].src); // Resim kaynaklarını diziye ekler
      }
    });
  });

  return imageLinks; // Resim kaynaklarının listesini döner
}
function get_kakao() {
  var imageLinks = [];
  
  // Tüm .mx-auto sınıfına sahip div'leri seç
  var containers = document.querySelectorAll(".mx-auto");
  
  containers.forEach(function(container) {
    // .mx-auto div'leri içindeki tüm relative ve w-full sınıflarına sahip div'leri seç
    var targetDivs = container.querySelectorAll("div.relative.w-full");
    
    targetDivs.forEach(function(targetDiv) {
      // Bu div içindeki class'ı "absolute top-0 h-full w-full overflow-hidden" olan div'leri seç
      var innerDivs = targetDiv.querySelectorAll("div.absolute.top-0.h-full.w-full.overflow-hidden");
      
      innerDivs.forEach(function(innerDiv) {
        // Bu div içindeki tüm img etiketlerini seç
        var images = innerDiv.getElementsByTagName("img");
        
        for (var i = 0; i < images.length; i++) {
          imageLinks.push(images[i].src); // Resim kaynaklarını diziye ekler
        }
      });
    });
  });

  return imageLinks; // Resim kaynaklarının listesini döner
}


function get_rizzfables() {
  var imageLinks = [];
  
  // "readerarea" id'sine sahip divi bul
  var readerAreaDiv = document.getElementById("readerarea");

  // Eğer div bulunduysa, içindeki resimleri tarayın
  if (readerAreaDiv) {
    var images = readerAreaDiv.getElementsByTagName("img");
    for (var i = 0; i < images.length; i++) {
      imageLinks.push(images[i].src);
    }
  } else {
    console.log("Div with id 'readerarea' not found.");
  }

  return imageLinks;
}
function get_mangagalaxy() {
  var imageLinks = [];
  
  // Seçici doğru kullanılarak div'leri bulma
  var readerAreaDivs = document.querySelectorAll("section.w-full.flex.flex-col.justify-center.items-center");

  // Eğer div bulunduysa, içindeki resimleri tarayın
  if (readerAreaDivs.length > 0) {
    // Her bir div üzerinde döngü
    readerAreaDivs.forEach(function(div) {
      var images = div.getElementsByTagName("img");
      for (var i = 0; i < images.length; i++) {
        imageLinks.push(images[i].src);
      }
    });
  } else {
    console.log("Div with specified classes not found.");
  }

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
      sendResponse({ type: "madara" , imageLinks: imageLinks });
    } else if(type === "mangastream") {
      var imageLinks = getImageLinksFromScript();
      sendResponse({ type: "mangastream", imageLinks: imageLinks });
    }else if(type === "asura") {
      var imageLinks = get_asuracomics();
      sendResponse({ type: "asura", imageLinks: imageLinks });
    }else if(type === "rizzfables") {
      var imageLinks = get_rizzfables();
      sendResponse({ type: "rizzfables", imageLinks: imageLinks });
    }else if(type === "mangagalaxy") {
      var imageLinks = get_mangagalaxy();
      sendResponse({ type: "mangagalaxy", imageLinks: imageLinks });
    }else if(type === "reaper") {
      var imageLinks = get_reaper();
      sendResponse({ type: "reaper", imageLinks: imageLinks });
    }else if(type === "kakao") {
      var imageLinks = get_kakao();
      sendResponse({ type: "madara", imageLinks: imageLinks });
    } else {
      sendResponse({ error: "Unsupported type" });
    }
  }
});
