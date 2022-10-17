import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor() {}

  /**
   * 랜덤한 doc 아이디 만들기 함수
   * 2020-01-22 정재은
   */
  generateFilename() {
    var length = 10;
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text + new Date().valueOf();
  }

  /**
   * 이름 변환 함수 정재은 => 정OO, 고현 => 고O, 강다니엘 => 강OOO
   * @param name 변환할 풀네임
   * @param name 이름을 나타낼 문자
   *
   * 2020-01-22 정재은
   */
  getSecretName(name, text) {
    let tmp_name = name.substring(0, 1);
    if (tmp_name.length > 2) {
      for (var i = 1; i < name.length; i++) {
        tmp_name += text;
      }
    } else {
      for (var i = 1; i < 3; i++) {
        tmp_name += text;
      }
    }
    return tmp_name;
  }

  /**
   * 위도, 경도로 거리를 구하는 함수
   * @param lat1 내 현재위치 (위도) {latitude: Number}
   * @param lon1 내 현재위치 (경도) {longitude: Number}
   * @param lat2 리스트 목적지위치 (위도) {latitude: Number}
   * @param lon2 라스트 목적지위치 (경도) {longitude: Number}
   *
   * 2020-06-03 이재훈
   */
  measure(lat1, lon1, lat2, lon2) {
    var R = 6378.137;
    var dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
    var dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    var meter = Math.floor(d * 1000);
    var km = Math.floor(meter / 1000);
    let type = '';
    if (km > 1) {
      type = 'km';
    } else {
      type = 'm';
    }
    return { meter: meter, km: km, type: type };
  }

  /**
   * 생년으로 올해 나이를 구하는 함수
   * @param birthYear 생년 (number)
   *
   * 2020-07-21 정재은
   */
  calcAge(birthYear) {
    let nowYear = new Date().getFullYear();
    let age = nowYear - birthYear + 1;
    return age;
  }
}
