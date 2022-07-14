import base58
import json
import os
import typing

import ed25519


class Key:
    account_id: str
    pk: str
    sk: str

    def __init__(self, account_id: str, pk: str, sk: str) -> None:
        super(Key, self).__init__()
        self.account_id = account_id
        self.pk = pk
        self.sk = sk

    @classmethod
    def implicit_account(cls) -> 'Key':
        keys = ed25519.create_keypair(entropy=os.urandom)
        account_id = keys[1].to_bytes().hex()
        sk = 'ed25519:' + base58.b58encode(keys[0].to_bytes()).decode('ascii')
        pk = 'ed25519:' + base58.b58encode(keys[1].to_bytes()).decode('ascii')
        return cls(account_id, pk, sk)

    @classmethod
    def from_json(cls, j: typing.Dict[str, str]):
        return cls(j['account_id'], j['public_key'], j['secret_key'])

    @classmethod
    def from_json_file(cls, filename: str):
        with open(filename) as rd:
            return cls.from_json(json.load(rd))

    def decoded_pk(self) -> bytes:
        key = self.pk.split(':')[1] if ':' in self.pk else self.pk
        return base58.b58decode(key.encode('ascii'))

    def decoded_sk(self) -> bytes:
        key = self.sk.split(':')[1] if ':' in self.sk else self.sk
        return base58.b58decode(key.encode('ascii'))

    def to_json(self):
        return {
            'account_id': self.account_id,
            'public_key': self.pk,
            'secret_key': self.sk
        }

    def sign_bytes(self, data: typing.Union[bytes, bytearray]) -> bytes:
        sk = self.decoded_sk()
        return ed25519.SigningKey(sk).sign(bytes(data))
