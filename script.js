function adStack() {
  function getAdIDs() {
    //returns the title ans ids of all the ads in the page
    const title = document.getElementsByTagName("title")[0].text;
    let dom = document.querySelectorAll("*");
    let ids = [];
    let blockedAds = false;
    dom.forEach((el) => {
      if (el.style.display === "none") blockedAds = true;
      else if (el.id) {
        var parts = el.id.split("-");
        parts = parts.map((part) => part.toLowerCase());
        if (parts.includes("ad") || parts.includes("ads")) ids.push(el.id);
      }
    });

    return {
      ids: ids,
      title,
      blockedAds: blockedAds,
    };
  }

  function getDimens(el) {
    //returns the dimensions of the element
    const rect = el.getBoundingClientRect();
    return {
      id: el.id,
      left: rect.left + window.scrollX,
      right: rect.right,
      top: rect.top + window.scrollY,
      bottom: rect.bottom,
    };
  }

  function findAdStacks() {
    const idRet = getAdIDs();
    const idArr = idRet.ids;
    //get the ids of all the ads in the page

    const elArr = idArr.map((id) => getDimens(document.getElementById(id)));
    //get the elements associated with the IDs

    var adLocs = [];
    //would hold the locations of various ads on the page along with their count

    elArr.forEach((el) => {
      var flag = false;
      //the flag would tell if the current ad is being stacked at existing location

      for (var i = 0; i < adLocs.length; i++) {
        if (
          adLocs[i].dimens.left == el.left &&
          adLocs[i].dimens.right == el.right &&
          adLocs[i].dimens.top == el.top &&
          adLocs[i].dimens.bottom == el.bottom
        ) {
          //if the ads are being stacked

          adLocs[i].adIds.push(el.id);
          flag = true;
          break;
        }
      }

      if (!flag) {
        adLocs.push({
          dimens: el, //the dimensions of the ad location
          adIds: [el.id], //the ids of the ads being stacked
        });
      }
    });

    var adIdArr = [];

    adLocs.forEach((adLoc) => {
      //   if (adLoc.adIds.length > 1)
      adIdArr.push(adLoc.adIds);
    });

    return {
      stack: adIdArr,
      blockAds: idRet.blockedAds,
      title: idRet.title,
    };
  }

  const adStacks = findAdStacks();

  return {
    success: true,
    stack: adStacks.stack,
    adsblocked: adStacks.blockAds,
    title: adStacks.title,
  };
}

(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let res = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: adStack,
  });
  const title = res[0].result.title;
  console.log(title);
  const stackedAds = res[0].result.stack;
  let adsblocked = res[0].result.adsblocked;

  let adStackCount = 0;
  let adCount = stackedAds.length;

  stackedAds.forEach((ad) => {
    if (ad.length > 1) adStackCount++;
  });

  const para = document.getElementById("ad_count");
  const stackPara = document.getElementById("total_count");

  stackPara.innerHTML = `There are ${adCount} ads on this page.`;
  if (adCount > 0)
    para.innerHTML = `Ads are being stacked at ${adStackCount} separate places.`;

  var content = document.getElementById("Content");

  for (var i = 0; i < stackedAds.length; i++) {
    var div = document.createElement("div");

    var sno = document.createElement("p");
    sno.innerHTML = 'SNo: <span class="elements--text">' + (i + 1) + "</span>";

    var desc = document.createElement("p");
    desc.innerHTML =
      'Description: <span class="elements--text">' + stackedAds[i] + "</span>";

    var count = document.createElement("p");
    count.innerHTML =
      `Count: <span class="elements--text">` + stackedAds[i].length + "</span>";

    var status = document.createElement("p");
    if (stackedAds[i].length > 1) {
      status.innerHTML =
        'Stacked: <span class="elements--text">' +
        '<span class="material-symbols-rounded i-yes">check_small</span></span>';
    } else {
      status.innerHTML =
        'Stacked: <span class="elements--text">' +
        '<span class="material-symbols-rounded i-no">close</span></span>';
    }

    div.classList.add("content_box");
    sno.classList.add("content_box--p");
    desc.classList.add("content__box--p");
    count.classList.add("content__box--p");
    status.classList.add("content__box--p");

    div.appendChild(sno);
    div.appendChild(desc);
    div.appendChild(count);
    div.appendChild(status);
    content.appendChild(div);
  }

  //block ads button
  const blockButton = document.getElementById("btn--block");

  if (adsblocked) blockButton.innerHTML = "Unblock Ads";

  if (adCount > 0 || adsblocked) {
    function blockAds() {
      function getAdIDs() {
        let dom = document.querySelectorAll("*");
        let ids = [];

        dom.forEach((el) => {
          if (el.id) {
            var parts = el.id.split("-");
            parts = parts.map((part) => part.toLowerCase());
            if (parts.includes("ad") || parts.includes("ads")) ids.push(el.id);
          }
        });

        return ids;
      }

      let adID = getAdIDs();

      console.log(adID);

      adID.forEach((adId) => {
        document.getElementById(adId).style.display = "none";
      });
    }

    function unblockAds() {
      function getAdIDs() {
        let dom = document.querySelectorAll("*");
        let ids = [];

        dom.forEach((el) => {
          if (el.id) {
            var parts = el.id.split("-");
            parts = parts.map((part) => part.toLowerCase());
            if (parts.includes("ad") || parts.includes("ads")) ids.push(el.id);
          }
        });

        return ids;
      }

      let adID = getAdIDs();

      console.log(adID);

      adID.forEach((adId) => {
        document.getElementById(adId).style.display = "block";
      });
    }

    blockButton.addEventListener("click", async function () {
      if (adsblocked) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: unblockAds,
        });

        blockButton.innerHTML = "Block Ads";
      } else {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: blockAds,
        });

        blockButton.innerHTML = "Unblock Ads";
      }

      adsblocked = !adsblocked;
      location.reload();
    });
  } else {
    blockButton.style.display = "none";
  }

  //api call
  const apiButton = document.getElementById("btn--api");

  apiButton.addEventListener("click", async function () {
    let data = { title, ads: stackedAds };
    let postReq = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
    fetch("http://127.0.0.1:3000/item/new", postReq).then((res) =>
      console.log(res)
    );
  });
})();
