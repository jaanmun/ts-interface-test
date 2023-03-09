import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor() {}

  /**
   * 이메일 정규식
   * @param {string} email
   * @returns
   */
  checkEmailFormat(email: string) {
    const emailReg =
      /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
    return emailReg.test(email);
  }

  /**
   * 비밀번호 정규식
   * @param {string} pwd
   * @returns
   */
  checkPwdFormat(pwd: string) {
    const pwdReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return pwdReg.test(pwd);
  }

  /**
   * 이름 정규식
   * @param {string} name
   * @returns
   */
  checkNameFormat(name: string) {
    const nameReg = /^([a-zA-Z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣]).{1,5}$/;
    return nameReg.test(name);
  }

  /**
   * 이름 정규식 - only한글
   * @param {string} name
   * @returns
   */
  checkNameKoreanFormat(name: string) {
    const engExp = /[a-zA-Z]/;
    const regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
    const nameReg = /^([ㄱ-ㅎ|가-힣]).{1,5}$/;
    return nameReg.test(name) && !regExp.test(name) && !engExp.test(name);
  }

  /**
   * 닉네임 정규식
   * @param nickName
   * @returns
   */
  checkNicknickNameFormat(nickName: string) {
    const regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
    const nickNameReg = /^([a-zA-Z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣]).{1,7}$/;
    return nickNameReg.test(nickName) && !regExp.test(nickName);
  }

  /**
   * 휴대폰 번호 정규식
   * @param {string} phone
   * @returns
   */
  checkPhoneFormat(phone: string) {
    const phoneReg = /^.*(?=^.{10,11}$)(?=.*[0-9]).*$/;
    return phoneReg.test(phone);
  }

  /**
   * 사업자번호 번호 정규식
   * @param {string} buisnessNum
   * @returns
   */
  checkBusinessNumberormat(buisnessNum: string) {
    const buisnessNumReg = /^.*(?=^.{10}$)(?=.*[0-9]).*$/;
    return buisnessNumReg.test(buisnessNum);
  }
}
