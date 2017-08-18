import crypto from 'crypto';
let uiid = {
    genSingleUseToken() {
        let sequenceNumber = Date.now() | 0;
        let rand = new Buffer(15); // multiple of 3 for base64
        sequenceNumber = (sequenceNumber + 1) | 0;
        rand.writeInt32BE(sequenceNumber, 11);
        crypto.randomBytes(12).copy(rand);
        return rand.toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
    }
};

export default uiid;