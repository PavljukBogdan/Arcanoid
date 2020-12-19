import View from "./View"
import Model from "./Model"
import Controller from "./Controller";
import ViewText from "./ViewText";

declare global {
    interface Window {
        view: View;
        model: Model;
        viewText: ViewText;
        controller: Controller;
    }
}

const root = document.querySelector('#root');

const model = new Model();
const viewText = new ViewText();
const view = new View(root,550,660, model);
const controller = new Controller(model, view, viewText);


window.view = view;
window.model = model;
window.viewText = viewText;
window.controller = controller;
