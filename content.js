  class ScanResults {
    constructor(id, name, domain, fav, imgScanResults) {
      (this.id = id),
        (this.name = name),
        (this.domain = domain),
        (this.fav = fav),
        (this.imgScanResults = imgScanResults);
    }
  }

  class ImageScanResults {
    constructor(
      id,
      name,
      source,
      alt,
      node,
      parentNode,
      parentClassName,
      messages
    ) {
      (this.id = id),
        (this.name = name),
        (this.source = source),
        (this.alt = alt),
        (this.node = node),
        (this.parentNode = parentNode),
        (this.parentClassName = parentClassName),
        (this.messages = messages);
    }
  }

  class ImageScanResultsMessages {
    constructor(id, name, type, result, message, fix) {
      (this.id = id),
        (this.name = name),
        (this.type = type),
        (this.result = result),
        (this.message = message),
        (this.fix = fix);
    }
  }

  let finalScanResults = function startScan() {
    let scanResults = new ScanResults(
      (id = document.title),
      (name = document.location.host),
      (domain = document.URL),
      (fav = document.domain + "/favicon.ico")
    );
    let siteImages = [...document.images];
    let imageScanResults = new Array();
    siteImages.forEach((i) => {
      if (i !== null) {
        imageScanResults.push(getImageScanResults(i));
      }
      scanResults.imgScanResults = imageScanResults;
      let jsonResults = JSON.stringify(scanResults, null, 2);
      saveResults(jsonResults);
      return jsonResults;
    });
  };

function getImageScanResults(i) {
  let imageScanResult = new ImageScanResults(
    i.id,
    i.className,
    i.src,
    i.alt,
    i.nodeName,
    i.parentNode.nodeName,
    i.parentNode.className
  );
  hasAlt =
    i.alt !== null && i.alt !== undefined && i.alt !== "" && i.hidden !== true;
  /*     && i.hasAttribute("style")
      ? i.attributes.getNamedItem("style").value.includes("visibility:hidden;")
      : false */

  let imageScanResultsMessages = new Array();
  if (getDescriptiveResults(i)) {
    imageScanResultsMessages.push(getDescriptiveResults(i));
  }
  if (getDescriptiveResults(i)) {
    imageScanResultsMessages.push(getCharacterCountResults(i));
  }

  imageScanResult.messages = new Array();
  imageScanResult.messages.push(imageScanResultsMessages);

  return imageScanResult;
}

function getDescriptiveResults(i) {
  let altSplit = i.alt.split(" ");
  let dashSplit = i.alt.split("-");
  console.table(dashSplit, i.alt);
  let findDuplicates = (arr) =>
    arr.filter((item, index) => arr.indexOf(item) != index);
  let duplicates = [...new Set(findDuplicates(altSplit))];
  let scanType = "Is Image Alt Tag Descriptive";

  if (!hasAlt) {
    return new ImageScanResultsMessages(
      1,
      i.src,
      scanType,
      "Danger",
      "Image does not have an alt tag.",
      "Add a robust description of the image."
    );
  } else if (altSplit.length < 3) {
    return new ImageScanResultsMessages(
      2,
      i.src,
      scanType,
      "Warning",
      "Image alt tag is not complex enough.",
      "Add a more robust description of the image."
    );
  } else if (dashSplit.length > 2) {
    return new ImageScanResultsMessages(
      3,
      i.src,
      scanType,
      "Warning",
      "Image alt tag contains too many dashes(-) and/or does not include readable words.",
      "Remove unessasary dashes and use full words."
    );
  } else if (duplicates.length > 1) {
    return new ImageScanResultsMessages(
      3,
      i.src,
      scanType,
      "Warning",
      "Image alt tag is descriptive but includes duplicates.",
      "Remove any duplicates and check for complete sentenses."
    );
  } else {
    return new ImageScanResultsMessages(
      4,
      i.src,
      scanType,
      "Success",
      "Image alt tag is descriptive",
      "No Recommendations"
    );
  }
}

function getCharacterCountResults(i) {
  let scanType = "Is Image Alt Tag within Most E-Reader Character Limits";

  if (hasAlt) {
    if (i.alt.length < 2) {
      return new ImageScanResultsMessages(
        1,
        i.src,
        scanType,
        "Warning",
        "Alt is " + i.alt.length + " characters long",
        "Add a robust description of the image."
      );
    } else if (i.alt.length > 1 && i.alt.length < 126) {
      return new ImageScanResultsMessages(
        2,
        i.src,
        scanType,
        "Success",
        "Alt is " + i.alt.length + " characters long",
        "Within 125 character limit.  No Recommendations."
      );
    } else {
      return new ImageScanResultsMessages(
        3,
        i.src,
        scanType,
        "Danger",
        "Alt is " + i.alt.length + " characters long",
        'Most popular screen readers cut off alt text at around 125 characters, so its advisable to keep it to that character count or less.  Explore using the longdesc="" tag for more complex images that require a longer description.'
      );
    }
  } else {
    return new ImageScanResultsMessages(
      4,
      i.src,
      scanType,
      "Danger",
      "Alt is 0 characters long",
      "Add a robust description of the image."
    );
  }
}

function saveResults(jsonResults) {
  localStorage.setItem("ImageScanResults", jsonResults);
  console.table("Saved Results", "Successful");
  console.table(jsonResults);

}

finalScanResults();
