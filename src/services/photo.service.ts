import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoadingService } from './loading.service';
import firebase from 'firebase/compat/app';
import { CommonService } from './common.service';
import { Capacitor } from '@capacitor/core';
import { DomSanitizer } from '@angular/platform-browser';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string;
  path: string;
  data: string;
}

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  project = 'waiters-37a98.appspot.com';

  public cameraOption = {
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera,
    allowEditing: false,
    quality: 60,
    // correctOrientation: false, // false로 설정할 경우 촬영한 사진 기준 좌로 90도 돌아간다.
  };

  public galleryOption = {
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Photos,
    allowEditing: false,
    quality: 60,
  };

  constructor(
    private loadingService: LoadingService,
    private commonService: CommonService,
    private domSanitizer: DomSanitizer
  ) {}

  // firebase storage에 저장
  async saveStorage(type, image): Promise<string> {
    try {
      if (image.indexOf('https://') === -1) {
        const name = this.commonService.generateFilename();
        const imgData = await firebase
          .storage()
          .ref(`/${type}/` + name)
          .putString(image, 'data_url');
        console.log('imgData', imgData);

        const url = `https://storage.googleapis.com/${imgData.metadata.bucket}/${imgData.metadata.fullPath}`;
        return `${url}`;
      } else {
        return image;
      }
    } catch (error) {
      this.loadingService.hide();
      console.error('getCamera error', error);
      return '';
    }
  }

  // 카메라 실행
  public getPhoto(type: 'camera' | 'gallery') {
    return new Promise<any>(async (resolve) => {
      const image = await Camera.getPhoto(
        type === 'camera' ? this.cameraOption : this.galleryOption
      );
      const fileUrl = Capacitor.convertFileSrc(image.dataUrl);
      const url: any =
        this.domSanitizer.bypassSecurityTrustResourceUrl(fileUrl);

      resolve(url.changingThisBreaksApplicationSecurity);
    });
  }

  deleteImg(imgURL: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      console.log(imgURL);

      const url = imgURL.replace(
        `https://storage.googleapis.com/${this.project}/`,
        ''
      );
      const storageRef = firebase.storage().ref();
      storageRef
        .child(url)
        .delete()
        .then(() => {
          resolve('success');
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
