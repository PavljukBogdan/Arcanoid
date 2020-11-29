import View from "./View"
import Model from "./Model"
import Controller from "./Controller";

declare global {
    interface Window {
        view: View;
        model: Model;
        controller: Controller;
    }
}

const root = document.querySelector('#root');

const model = new Model();
const view = new View(root,550,660, model);
const controller = new Controller(model,view);


window.view = view;
window.model = model;
window.controller = controller;
