// Flow Show v1
// By Nelson Taruc
// This global array keeps track of arrows in the selection
// In the future, this may support non-arrows to change opacity of things connected to arrows
var currentlySelectedArrows = [];
// This global array keeps track of the selected flow of the selection
// Other values could be "MIXED" or "NONE"
var currentlySelectedFlow = "NONE";
var includeLockedConnectors = false;
figma.showUI(__html__, { themeColors: true });
figma.ui.resize(240, 224);
figma.on("run", () => {
    const anArray = retrieveSavedFlowNames();
    figma.ui.postMessage({ text: "initialize-flow-names", flowArray: anArray });
    alertIfNoConnectorsExist();
    checkSelectionForConnectors();
});
figma.on("selectionchange", () => {
    // console.log("New selection")
    checkSelectionForConnectors();
});
function retrieveSavedFlowNames() {
    const savedNameArrayString = figma.currentPage.getPluginData('FLOW-SHOW-NAME-ARRAY');
    const savedNameArray = savedNameArrayString.split(",");
    if (savedNameArray == null || savedNameArray.length != 3) {
        const nameArray = ["Flow 1", "Flow 2", "Flow 3"];
        return nameArray;
    }
    return savedNameArray;
}
function alertIfNoConnectorsExist() {
    const nodes = figma.currentPage.findAllWithCriteria({ types: ['CONNECTOR'] });
    if (nodes.length == 0) {
        figma.ui.postMessage({ text: "show-no-connector-alert", currentlySelectedFlow: currentlySelectedFlow });
    }
}
function checkSelectionForConnectors() {
    const aSelection = figma.currentPage.selection;
    currentlySelectedArrows = [];
    var flowArray = [];
    for (let i = 0; i < aSelection.length; i++) {
        const aNode = figma.currentPage.selection[i];
        if (aNode.type == 'CONNECTOR') {
            currentlySelectedArrows.push(aNode);
            if (aNode.getPluginData("show-flow") != null && aNode.getPluginData("show-flow") != "") {
                flowArray.push(aNode.getPluginData("show-flow"));
                // console.log("DEBUG FLOW ARRAY: " + flowArray);
            }
        }
    }
    if (currentlySelectedArrows.length > 0) {
        if (flowArray.length > 0) {
            const evaluatedArray = flowArray.every((val, i, arr) => val === arr[0]);
            if (evaluatedArray == true) {
                currentlySelectedFlow = flowArray[0];
            }
            else {
                currentlySelectedFlow = "MIXED";
            }
        }
        figma.ui.postMessage({ text: "show-select-tags", currentlySelectedFlow: currentlySelectedFlow });
    }
    else {
        currentlySelectedFlow = "NONE";
        figma.ui.postMessage({ text: "show-visibility-buttons", currentlySelectedFlow: currentlySelectedFlow });
    }
    // console.log(currentlySelectedArrows.length + " arrows selected, status is " + currentlySelectedFlow + " DEBUG FLOW ARRAY: " + flowArray);
}
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    if (msg.type === 'show-all') {
        toggleConnectorVisibilty(true, "all");
    }
    if (msg.type === 'hide-all') {
        toggleConnectorVisibilty(false, "all");
    }
    if (msg.type === 'show-flow-1') {
        toggleConnectorVisibilty(true, "1");
    }
    if (msg.type === 'show-flow-2') {
        toggleConnectorVisibilty(true, "2");
    }
    if (msg.type === 'show-flow-3') {
        toggleConnectorVisibilty(true, "3");
    }
    if (msg.type === 'tag-arrows-1') {
        addTag(currentlySelectedArrows, "1");
    }
    if (msg.type === 'tag-arrows-2') {
        addTag(currentlySelectedArrows, "2");
    }
    if (msg.type === 'tag-arrows-3') {
        addTag(currentlySelectedArrows, "3");
    }
    if (msg.type === 'tag-arrows-null') {
        addTag(currentlySelectedArrows, "");
    }
    if (msg.type === 'include-locked-true') {
        includeLockedConnectors = true;
    }
    if (msg.type === 'include-locked-false') {
        includeLockedConnectors = false;
    }
    if (msg.type === 'save-flow-names') {
        const nameArrayAsString = msg.nameArray.toString();
        figma.currentPage.setPluginData('FLOW-SHOW-NAME-ARRAY', nameArrayAsString);
    }
};
function toggleConnectorVisibilty(boolean, tagString) {
    const nodes = figma.currentPage.findAllWithCriteria({ types: ['CONNECTOR'] });
    for (let i = 0; i < nodes.length; i++) {
        if (includeLockedConnectors == true) {
            // Note: Plugin will change visibility of locked connector arrows
            if (tagString == 'all' || tagString == nodes[i].getPluginData("show-flow")) {
                nodes[i].visible = boolean;
            }
            else {
                nodes[i].visible = false;
            }
        }
        else {
            // Note: Plugin will ignore locked connector arrows; this is default behavior
            if (nodes[i].locked == false) {
                if (tagString == 'all' || tagString == nodes[i].getPluginData("show-flow")) {
                    nodes[i].visible = boolean;
                }
                else {
                    nodes[i].visible = false;
                }
            }
        }
    }
}
function addTag(elements, tagString) {
    for (let i = 0; i < elements.length; i++) {
        const aConnect = elements[i];
        aConnect.setPluginData("show-flow", tagString);
        // console.log(String(aConnect.getPluginData("show-flow")));
    }
}
