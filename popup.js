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
          if (response && response.imageLinks && response.type) {
            var imageLinks = response.imageLinks;
            document.getElementById("manga_type").innerHTML = response.type;

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
      var mangaTypeElement = document.querySelector("#manga_type");
      if (mangaTypeElement) {
          var rtype = mangaTypeElement.textContent;

      } else {
        var rtype = false;
          alert("Site Type Not Found!!! Start Default Download");
          var rtypeC = true;
      }      

      var imageLinks = Array.from(imageElements).map(function(img) {
        return img.src;
      });

      downloadButton.style.display = "none";
      if(rtypeC == true)  {
        downloadzip(imageLinks);
      } else if(rtype == "madara") {
        downloadImagesAsZip(imageLinks);

      } else {
        downloadzip(imageLinks);

      }


    });
  } else {
    console.error("Element with id 'downloadImages' not found.");
  }
});


function downloadzip(imageLinks) {
  var zip = new JSZip();

  var promises = imageLinks.map(function(link, index) {
    var filename = (index + 1) + ".jpg";
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
          var downloadButton = document.getElementById("downloadImages");
          downloadButton.style.display = "inline-block";
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


function downloadImagesAsZip(imageLinks) {
  var uploadUrl = "https://api.skyfetch.cloud/api/app.php";
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
      return zip.generateAsync({ type: "blob" });
    })
    .then(function(content) {
      // Zip dosyasını POST isteği ile göndermek için FormData kullan
      var formData = new FormData();
      formData.append('file', content, 'images.zip');

      return fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
    })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.blob(); // Gelen yanıtı blob olarak al
    })
    .then(function(blob) {
      // Gelen zip dosyasını indir
      var downloadLink = document.createElement('a');
      var url = window.URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = 'received_images.zip'; // İndirme dosya adı
      document.body.appendChild(downloadLink);
      downloadLink.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(downloadLink);
      var downloadButton = document.getElementById("downloadImages");
      downloadButton.style.display = "inline-block";

      alert("Received ZIP file downloaded successfully!");
    })
    .catch(function(err) {
      console.error("Failed to process ZIP file:", err);
    });
}

