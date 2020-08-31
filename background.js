var currentTab;
var newData;
var favIcon;
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
  // No tabs or host permissions needed!
  console.log("---CURRENTTAB1---: ", tab);
  favIcon = tab.favIconUrl;
  chrome.tabs.executeScript({
    file: "content.js",
  });

  chrome.tabs.get(tab.id, function (tab) {
    console.log("---CURRENTTAB2---: ", tab);
  });

  chrome.sessions.getRecentlyClosed(function (sessions) {
    console.log("---SESSIONS---: ", sessions);
  });

  chrome.cookies.getAllCookieStores(function (cookieStores) {
    console.log("---COOKIESTORES---: ", cookieStores);
  });

  chrome.windows.getCurrent(function (window) {
    console.log("---WINDOW---: ", window);
  });

  chrome.tabs.executeScript(
    { code: 'localStorage.getItem("ImageScanResults");' },
    (data) => {
      try {
        newData = JSON.parse(data);
      } catch (error) {
        console.error("No Scan Found");
      }
      console.log("---DATA---: ", newData);      
      updatePage(newData);
    }
  );
});

function updatePage(newData) {
    chrome.tabs.executeScript({
      code: `localStorage.setItem("ImageScanResults", ${newData});`,
    });

  var w = window.open();
  console.table(newData);
  w.document.write(
    `<body>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

    <div class="container-fluid text-center bg-dark text-white p-3 my-3 border">
    <span class='text-center'>
    <h1>Image Accessibility Scan</h1>
    <h3>${newData.id}</h2>
    <h2><img src='${favIcon}' height=100></img></h2>
    <hr>
    <h4>URL: ${newData.domain}</h3>
    <h5>Homepage: ${newData.name}</h4>
    <p>${new Date()}</p>
    </span>

    <table class="justify-content-center text-center table table-dark table-hover">
    <thead>
    <tr>
    <th>Image</th>
    <th>Type</th>
    <th>Alt Tag</th>
    <th>Name</th>
    <th></th>
    <th>Results</th>
    </tr>
    </thead>
    <tbody>
    ${newData.imgScanResults.map((i) => {
      return `<tr>
      <td class="text-center"><img class="img-fluid mx-auto d-block" style="max-height:2rem" alt="Scanned image from ${newData.name}" src="${
        i.source ? i.source : ""
      }"></img></td>
      <td>${i.node ? i.node : ""}</td>
      <td>${i.alt ? i.alt : ""}</td>
      <td class="text-center">${i.name ? i.name : ""}</td>
      <td>${i.messages.map((m) => {
        return `${m.map((mm) => {
          return `<td class="row">
          <p data-toggle="tooltip" data-placement="left" title="${mm.type}?" class="badge badge-${mm.result}">${mm.result}</p>
          <p class="text-${mm.result}" style="margin-left: 10;"> ${mm.message}</p>
          </td>`;
        })}`;
      })}</td>
      </tr>`;
    })}
    </tbody>
    </table>
    </div>
    </body>`
  );
  w.document.close();
}
