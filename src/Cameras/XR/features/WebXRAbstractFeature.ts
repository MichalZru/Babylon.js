import { IWebXRFeature } from '../webXRFeaturesManager';
import { Observer, Observable, EventState } from '../../../Misc/observable';
import { Nullable } from '../../../types';
import { WebXRSessionManager } from '../webXRSessionManager';

export abstract class WebXRAbstractFeature implements IWebXRFeature {

    constructor(protected _xrSessionManager: WebXRSessionManager) {

    }

    private _attached: boolean = false;
    private _removeOnDetach: {
        observer: Nullable<Observer<any>>;
        observable: Observable<any>;
    }[] = [];

    /**
     * Is this feature attached
     */
    public get attached() {
        return this._attached;
    }

    /**
     * attach this feature
     *
     * @returns true if successful.
     */
    public attach(): boolean {
        this._attached = true;
        this._addNewAttachObserver(this._xrSessionManager.onXRFrameObservable, (frame) => this._onXRFrame(frame));
        return true;
    }

    /**
     * detach this feature.
     *
     * @returns true if successful.
     */
    public detach(): boolean {
        this._attached = false;
        this._removeOnDetach.forEach((toRemove) => {
            toRemove.observable.remove(toRemove.observer);
        });
        return true;
    }
    /**
     * Dispose this feature and all of the resources attached
     */
    public dispose(): void {
        this.detach();
    }

    /**
     * Code in this function will be executed on each xrFrame received from the browser.
     * This function will not execute after the feature is detached.
     * @param _xrFrame the current frame
     */
    protected _onXRFrame(_xrFrame: XRFrame): void {
        // no-op
    }

    /**
     * This is used to register callbacks that will automatically be removed when detach is called.
     * @param observable the observable to which the observer will be attached
     * @param callback the callback to register
     */
    protected _addNewAttachObserver<T>(observable: Observable<T>, callback: (eventData: T, eventState: EventState) => void) {
        this._removeOnDetach.push({
            observable,
            observer: observable.add(callback)
        });
    }
}