// popup.js

document.addEventListener("DOMContentLoaded", function() {
  var findTitleButton = document.getElementById("findTitle");
  var copyTitleButton = document.getElementById("copyTitle");
  var downloadButton = document.getElementById("downloadImages");
  var selectElement = document.getElementById("type");

  if (findTitleButton) {
    findTitleButton.addEventListener("click", function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var selectedType = selectElement.value; 
        chrome.tabs.sendMessage(tabs[0].id, { action: "findTitle", type: selectedType }, function(response) {
          if (response && response.imageLinks) {
            var imageLinks = response.imageLinks;

            document.getElementById("titleContainer").innerHTML = "<h2>Images:</h2>";
            imageLinks.forEach(function(link) {
              var imgElement = document.createElement("img");
              imgElement.src = link;
              imgElement.style.maxWidth = "100%";
              document.getElementById("titleContainer").appendChild(imgElement);
            });

            if (imageLinks.length > 0) {
              downloadButton.style.display = "inline-block";
            } else {
              downloadButton.style.display = "none";
            }

            copyTitleButton.style.display = "none";
          } else {
            alert(imageLinks)
            console.error("Error fetching image links:", chrome.runtime.lastError);
          }
        });
      });
    });
  } else {
    console.error("Element with id 'findTitle' not found.");
  }

  if (copyTitleButton) {
    copyTitleButton.addEventListener("click", function() {
      var titleContainer = document.getElementById("titleContainer");
      var titleHTML = titleContainer.innerHTML;
      navigator.clipboard.writeText(titleHTML)
        .then(function() {
          console.log("Title copied to clipboard:", titleHTML);
          alert("Title copied to clipboard!");
        })
        .catch(function(err) {
          console.error("Failed to copy title:", err);
        });
    });
  } else {
    console.error("Element with id 'copyTitle' not found.");
  }

  if (downloadButton) {
    downloadButton.addEventListener("click", function() {
      var imageElements = document.querySelectorAll("#titleContainer img");
      var imageLinks = Array.from(imageElements).map(function(img) {
        return img.src;
      });

      downloadImagesAsZip(imageLinks);
    });
  } else {
    console.error("Element with id 'downloadImages' not found.");
  }
});

function downloadImagesAsZip(imageLinks) {
  var zip = new JSZip();

  var promises = imageLinks.map(function(link, index) {
    var filename = "image_" + (index + 1) + ".jpg";
    return fetch(link)
      .then(function(response) {
        return response.blob();
      })
      .then(function(blob) {
        zip.file(filename, blob, { binary: true });
      })
      .catch(function(err) {
        console.error("Failed to fetch image:", err);
      });
  });

  Promise.all(promises)
    .then(function() {
      zip.generateAsync({ type: "blob" })
        .then(function(content) {
          saveAs(content, "images.zip");
          alert("Images downloaded as ZIP successfully!");
        })
        .catch(function(err) {
          console.error("Failed to generate ZIP file:", err);
        });
    })
    .catch(function(err) {
      console.error("Failed to download images:", err);
    });
}
