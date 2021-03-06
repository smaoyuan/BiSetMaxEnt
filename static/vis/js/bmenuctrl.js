/*
 * add menu to bics
 * @param bicCssClass, string, the css class of bic objects
 */
var addMenuToBic = function(bicCssClass) {
    // add contextmenu to bics
    $("." + bicCssClass).contextmenu({
        target: '#bic-context-menu',
        onItem: function(context, e) {

            var thisBicID = $(context).attr("id"),
                selItem = $(e.target).attr("data-index");

            if (selItem == "doc") {

                var relDocs = allBics[thisBicID].docs,
                    rType = allBics[thisBicID].rowField,
                    cType = allBics[thisBicID].colField,
                    rows = allBics[thisBicID].row,
                    cols = allBics[thisBicID].col;

                var docNames = {},
                    docNameIndex = [],
                    rNames = [],
                    cNames = [];

                var docNameStr = "",
                    rNameStr = "",
                    cNameStr = "";

                for (e in relDocs) {
                    docNameIndex.push(allDocs[relDocs[e]].docName);
                    docNames[allDocs[relDocs[e]].docName] = allDocs[relDocs[e]];
                    docNameStr += "<label class='btn btn-success btn-xs bicToDocLable' data-index='" + allDocs[relDocs[e]].docID + "'>" + allDocs[relDocs[e]].docName + "</label> &nbsp";
                }

                for (e in rows) {
                    var tmp = rType + "_" + rows[e];
                    rNames.push(allEnts[tmp].entValue);
                    rNameStr += allEnts[tmp].entValue + ", ";
                }

                for (e in cols) {
                    var tmp = cType + "_" + cols[e];
                    cNames.push(allEnts[tmp].entValue);
                    cNameStr += allEnts[tmp].entValue + ", ";
                }

                var docID = docNameIndex[0];
                for (e in docNames) {
                    if (docNames[e].bicNum > docNames[docNameIndex[0]].bicNum)
                        docID = e;
                }

                // update the document view
                var dContent = biset.tagEntsInDoc(docNames[docID].docContent, allEnts);
                biset.docViewReFresh(docID, dContent);
                biset.nextedTagReplace("em");
                biset.entTextHoverHandler();
                biset.entTextClickHandler();

                // append the bicluster ID
                $("#current_visit").html("Bicluster ID: " + allBics[thisBicID].bicID);

                // append related documents
                $("#related_docs").html(docNameStr);

                // append related entities
                var tmpStr = rNameStr + cNameStr,
                    relEntNameStr = tmpStr.substr(0, tmpStr.length - 2);
                $("#related_ents").html(relEntNameStr);

                // show document view
                if ($("#doc_vis").is(":hidden") == true) {
                    $("#doc_vis").slideToggle("slow");
                    // change the control icon
                    $("#doc_ctrl_icon").removeClass('glyphicon-folder-close');
                    $("#doc_ctrl_icon").addClass('glyphicon-remove-sign');
                }

                // add click event handler for doc labels on the left
                $(".bicToDocLable").click(function() {
                    var thisDocID = $(this).attr("data-index"), // e.g., DOC_1, DOC_12
                        thisDocName = allDocs[thisDocID].docName, // e.g., se5, fbi11
                        thisDocContent = allDocs[thisDocID].docContent;

                    var content = biset.tagEntsInDoc(thisDocContent, allEnts);
                    biset.docViewReFresh(thisDocName, content);
                    biset.nextedTagReplace("em");

                    biset.entTextHoverHandler();
                    biset.entTextClickHandler();
                });

                // add click event handler for each item in docID list
                biset.docViewUpdateByClick(".doc-list", allEnts);
            }

            if (selItem == "selection") {
                console.log("bic selection switch");
            }

            if (selItem == "entMove") {
                console.log("move ent switch");
            }

            // user choose to do stepwise evaluations
            if (selItem == "modelEvaStep") {
                biset.bicStepModelEvaluate(thisBicID);
            }

            // user choose to full path evaluation
            if (selItem == "modelEvaPath") {
                biset.bicFullPathModelEvaluate(thisBicID);
            }

            // enable selection for this bic
            if (selItem == "selOn") {
                allBics[thisBicID].bicSelectOn = true;
            }
            // disable selection for this bic
            if (selItem == "selOff") {
                allBics[thisBicID].bicSelectOn = false;
            }

            if (selItem == "hide") {
                biset.setVisibility(thisBicID, "hidden");
                for (e in connections) {
                    if (e.indexOf(thisBicID) >= 0)
                        biset.setVisibility(e, "hidden");
                }
            }

            // hide the connected edges
            if (selItem == "hideLine") {
                for (e in connections) {
                    if (e.indexOf(thisBicID) >= 0)
                        biset.setVisibility(e, "hidden");
                }
            }

            // show connected edges
            if (selItem == "showLine") {
                for (e in connections) {
                    if (e.indexOf(thisBicID) >= 0)
                        biset.setVisibility(e, "visable");
                }
            }
        }
    });
}


/*
 * set checkbox to the a switch style
 * @param name, string, the name of the checkbox
 */
var setSwitchMenuItem = function(name) {
    $("[name='" + name + "']").bootstrapSwitch();
}


/*
 * set the mark selection in the bic menu
 * @param bicMenuID, string, the id of ctrl menu on bics
 * @param markCtrlName, string, the mark ctrl name
 */
var bicMenuMark = function(bicMenuID, markCtrlName) {
    $('#' + bicMenuID).on('show.bs.context', function(context, e) {

        var thisBicID = $(context.target).attr("id"),
            thisBicSelOption = allBics[thisBicID].bicSelectOn,
            thisBicData = biset.getBindDataByBid(thisBicID);
        thisBicData.bicMenuOnShow = true;

        // use a global array to maintain the bic whose menu is shown
        bicShowMenu.push(thisBicID);

        // set the switch for each bic
        if (thisBicSelOption == false) {
            $("[name='" + markCtrlName + "']").bootstrapSwitch('state', false, true);
        } else {
            $("[name='" + markCtrlName + "']").bootstrapSwitch('state', true, true);
        }

        $("input[name='" + markCtrlName + "']").on('switchChange.bootstrapSwitch', function(event, state) {
            allBics[thisBicID].bicSelectOn = state;
        });
    });

    $('#' + bicMenuID).on('hide.bs.context', function(context, e) {
        var thisBicID = bicShowMenu.pop(),
            thisBicData = biset.getBindDataByBid(thisBicID);
        thisBicData.bicMenuOnShow = false;

        // make sure the mouse is not on a bic
        if (bicOnMouseover.length == 0) {
            biset.bicMoutHandler(thisBicData, relations, entPathCaled);
        }
    });
}


/*
 * set the switch widget in the bic menu
 * @param bicMenuID, string, the id of ctrl menu on bics
 * @param ctrlName, string, the mark ctrl name
 * @param field, string, the field in the bic data
 */
var bicMenuSwitch = function(bicMenuID, ctrlName, field) {
    $('#' + bicMenuID).on('show.bs.context', function(context, e) {
        var thisBicID = $(context.target).attr("id"),
            thisBicMoveEntOption = allBics[thisBicID][field];

        if (thisBicMoveEntOption == false) {
            $("[name='" + ctrlName + "']").bootstrapSwitch('state', false, true);
        } else {
            $("[name='" + ctrlName + "']").bootstrapSwitch('state', true, true);
        }

        $("input[name='" + ctrlName + "']").on('switchChange.bootstrapSwitch', function(event, state) {
            allBics[thisBicID][field] = state;
        });
    });
}


var addMenuToEnt = function(entClass) {
    $("." + entClass).contextmenu({
        target: '#ent-context-menu',
        onItem: function(context, e) {
            var thisEntID = context.attr("id"),
                thisFrameID = thisEntID + "_frame",
                selItem = $(e.target).attr("data-index");

            console.log(selItem);
            console.log(thisEntID);
            console.log(allEnts);
            switch (selItem) {
                case "doc":
                    {
                        var relDocs = allEnts[thisEntID].docs;
                        // rType = allEnts[thisEntID].rowField,
                        // cType = allEnts[thisEntID].colField,
                        // rows = allEnts[thisEntID].row,
                        // cols = allEnts[thisEntID].col;

                        var docNames = {},
                            docNameIndex = [],
                            rNames = [],
                            cNames = [];

                        var docNameStr = "",
                            rNameStr = "",
                            cNameStr = "";

                        for (e in relDocs) {
                            docNameIndex.push(allDocs[relDocs[e]].docName);
                            docNames[allDocs[relDocs[e]].docName] = allDocs[relDocs[e]];
                            docNameStr += "<label class='btn btn-success btn-xs bicToDocLable' data-index='" + allDocs[relDocs[e]].docID + "'>" + allDocs[relDocs[e]].docName + "</label> &nbsp";
                        }

                        // for (e in rows) {
                        //     var tmp = rType + "_" + rows[e];
                        //     rNames.push(allEnts[tmp].entValue);
                        //     rNameStr += allEnts[tmp].entValue + ", ";
                        // }

                        // for (e in cols) {
                        //     var tmp = cType + "_" + cols[e];
                        //     cNames.push(allEnts[tmp].entValue);
                        //     cNameStr += allEnts[tmp].entValue + ", ";
                        // }

                        var docID = docNameIndex[0];
                        for (e in docNames) {
                            if (docNames[e].bicNum > docNames[docNameIndex[0]].bicNum)
                                docID = e;
                        }

                        // update the document view
                        var dContent = biset.tagEntsInDoc(docNames[docID].docContent, allEnts);
                        biset.docViewReFresh(docID, dContent);
                        biset.nextedTagReplace("em");
                        biset.entTextHoverHandler();
                        biset.entTextClickHandler();

                        var thisEntType = allEnts[thisEntID].entType,
                            uniqueTypes = biset.getUniqueEntType(allEnts);

                        if (uniqueTypes.length <= 10) {
                            var tagColor = colorSet.group10;
                        } else {
                            var tagColor = colorSet.group20;
                        }

                        var entColor = tagColor[uniqueTypes.indexOf(thisEntType)],
                            entStr = "Entity: <em class='visited " + thisEntType + "' id='visited__" + thisEntID + "' style='background-color:" + entColor + "'>" + allEnts[thisEntID].entValue + "</em>";

                        // append the entity ID
                        $("#current_visit").html(entStr);

                        // append related documents
                        $("#related_docs").html(docNameStr);

                        // append related entities
                        // var tmpStr = rNameStr + cNameStr,
                        //     relEntNameStr = tmpStr.substr(0, tmpStr.length - 2);
                        // $("#related_ents").html(relEntNameStr);


                        // show document view
                        if ($("#doc_vis").is(":hidden") == true) {
                            $("#doc_vis").slideToggle("slow");
                            // change the control icon
                            $("#doc_ctrl_icon").removeClass('glyphicon-folder-close');
                            $("#doc_ctrl_icon").addClass('glyphicon-remove-sign');
                        }
                        // add click event handler for doc labels on the left
                        $(".bicToDocLable").click(function() {
                            var thisDocID = $(this).attr("data-index"), // e.g., DOC_1, DOC_12
                                thisDocName = allDocs[thisDocID].docName, // e.g., se5, fbi11
                                thisDocContent = allDocs[thisDocID].docContent;

                            var content = biset.tagEntsInDoc(thisDocContent, allEnts);
                            biset.docViewReFresh(thisDocName, content);
                            //remove nested tags
                            biset.nextedTagReplace("em");

                            biset.entTextHoverHandler();
                            biset.entTextClickHandler();
                        });
                        // add click event handler for each item in docID list
                        biset.docViewUpdateByClick(".doc-list", allEnts);
                        break;
                    }
                case "link":
                    {
                        break;
                    }
                default:
                    break;
            }
        }
    });
}


var addMenuToMbic = function(mbClass) {
    $("." + mbClass).contextmenu({
        target: '#mbic-context-menu',
        onItem: function(context, e) {
            var thisMbicFrameID = context.attr("id"),
                selItem = $(e.target).attr("data-index"),
                mbData = biset.getBindDataByBid(thisMbicFrameID),
                mbID = mbData.bicIDCmp,
                bics = mbData.bics;

            if (selItem == "split") {
                var mergedBics = mbData.bics,
                    links = mbData.linkIDs;

                // remove the merged bic with its links
                biset.removeMbicByID(mbID);
                biset.removeLinks(links);

                // show individual bic and their links
                for (var i = 0; i < mergedBics.length; i++) {
                    var thisBicData = biset.getBindDataByBid(mergedBics[i]),
                        thisBicLinkIDs = thisBicData.linkIDs;

                    biset.setLinksVisible(thisBicLinkIDs, "show");
                    biset.bicVisible(mergedBics[i], "show");

                    // flag this individual bic is not merged
                    thisBicData.merged = false;
                }

                biset.updateLink(connections);
                
            }
            // user choose to do stepwise evaluations
            if (selItem == "modelEvaStep") {
                biset.mbicStepModelEvaluate(bics);
            }

            // user choose to full path evaluation
            if (selItem == "modelEvaPath") {
                biset.mbicFullPathModelEvaluate(bics);
            }

            if (selItem == "hideLine") {
                var linkIDs = mbData.linkIDs;
                biset.setLinksVisible(linkIDs, "hidden");
            }

            if (selItem == "showLine") {
                var linkIDs = mbData.linkIDs;
                biset.setLinksVisible(linkIDs, "visable");
            }
        }
    });
}
