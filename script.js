console.log("script loaded");

function adStack(){  

    function findAdStacks(){

        function getAdIDs(){    //returns the ids of all the ads in the page
            let dom = document.querySelectorAll("*");
            let ids = [];
            
            dom.forEach(el => {    
                if (el.id) {
                    var parts = el.id.split("-");
                    parts = parts.map(part => part.toLowerCase());
                    if(parts.includes('ad') || parts.includes('ads'))
                        ids.push(el.id);
                    }
            });

            return ids;
        }   

        function getDimens(el) {    //returns the dimensions of the element
            const rect = el.getBoundingClientRect();
            return {
                id: el.id,
                left: rect.left + window.scrollX,
                right: rect.right,
                top: rect.top + window.scrollY,        
                bottom: rect.bottom
            };
        }

        const idArr = getAdIDs();    
        //get the ids of all the ads in the page
            
        const elArr = idArr.map(id => getDimens(document.getElementById(id)));
        //get the elements associated with the IDs
        
        var adLocs = [];    
        //would hold the locations of various ads on the page along with their count
        
        elArr.forEach(el => {
            
            var flag = false;
            //the flag would tell if the current ad is being stacked at existing location
            
            for(var i = 0; i < adLocs.length; i++){
                if(adLocs[i].dimens.left == el.left && 
                    adLocs[i].dimens.right == el.right && 
                    adLocs[i].dimens.top == el.top && 
                    adLocs[i].dimens.bottom == el.bottom){  //if the ads are being stacked

                    adLocs[i].adIds.push(el.id);
                    flag = true;
                    break;                    
                }
            }
            
            if(!flag){
                adLocs.push({
                    dimens: el,         //the dimensions of the ad location
                    adIds: [el.id]      //the ids of the ads being stacked
                });
            }
            
        });
        
        var adIdArr = [];
        
        adLocs.forEach(adLoc => {
            if(adLoc.adIds.length > 1)
            adIdArr.push(adLoc.adIds);
        }); 
        
        return adIdArr;
    }

    const adStacks = findAdStacks();
    var str = "";
    str += "ADs are being stacked at " + adStacks.length + " locations.\n";
    // console.log("ADs are being stacked at " + adStacks.length + " locations.");
    
    for(var i = 0; i < adStacks.length; i++){
        str += "At location " + (i+1) + ", ADs with the following IDs are being stacked: \n";
        // console.log("At location " + (i+1) + ", ADs with the following IDs are being stacked: ");
        adStacks[i].forEach(ad => str+= ad + "\n");
    }
    
    // console.log(str);
    return {
        success: true,
        stack: adStacks
    };

}


(async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    let res = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: adStack,
    });

    const stackedAds = res[0].result.stack;

    console.log(stackedAds);

    let adCount = stackedAds.length;

    const para = document.getElementById("ad_count");

    para.innerHTML = `Ads are being stacked at ${adCount} separate places`;
})();


