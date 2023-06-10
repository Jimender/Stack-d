function getAdIDs(){    //returns the ids of all the ads in the page
    var ids = [];
    try{          
        ids = $("*").map(function() {                
            if (this.id) {
                var parts = this.id.split("-");
                parts = parts.map(part => part.toLowerCase());
                if(parts.includes('ad') || parts.includes('ads'))
                    return this.id;
                }
            }).get();
    } finally {
        return ids;
    }
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
    
    function findAdStacks(){
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

function adStack(){
    const adStacks = findAdStacks();
    var str = "";
    str += "ADs are being stacked at " + adStacks.length + " locations.\n";
    // console.log("ADs are being stacked at " + adStacks.length + " locations.");
    
    for(var i = 0; i < adStacks.length; i++){
        str += "At location " + (i+1) + ", ADs with the following IDs are being stacked: ";
        // console.log("At location " + (i+1) + ", ADs with the following IDs are being stacked: ");
        adStacks[i].forEach(ad => str+= ad + "\n");
    }
    
    console.log(str);
}

adStack();