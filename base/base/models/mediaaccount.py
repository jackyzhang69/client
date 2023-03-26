from pydantic import BaseModel
from typing import Optional, List


class MediaAccount(BaseModel):
    media: Optional[str]
    account: Optional[str]
    password: Optional[str]
    security_answer: Optional[str]
    remark: Optional[str]


class MediaAccounts(BaseModel):
    media_accounts: List[MediaAccount]

    def get_media_by_name(self, media_name: str):
        for media_account in self.media_accounts:
            if (
                media_account.media
                and media_account.media.lower() == media_name.lower()
            ):
                return media_account
        return None
