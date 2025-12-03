import { prisma } from "@/lib/prisma";

export const checkLockOut = async (user: any) => {
  const now = new Date();

  if (user?.isLocked) {
    if (user?.lockUntil && user?.lockUntil > now) {
      return {
        locked: true,
        message: `Account locked until ${
          user.lockUntil?.toLocaleString() || "later"
        }`,
        redirect: "/account-locked",
        lockUntil: user.lockUntil,
      };
    }
  }

  await prisma.user.update({
    where: { id: user?.id },
    data: {
      isLocked: false,
      lockUntil: null,
      failedAttempts: 0,
    },
  });

  return { locked: false };
};

export async function handleFailedAttempt(user: any) {
  const attempts = user?.failedAttempts + 1;

  if (attempts >= 5) {
    const lockDuration = 10 * 60 * 1000; // 10 minutes
    const lockUntil = new Date(Date.now() + lockDuration);

    await prisma.user.update({
      where: { id: user?.id },
      data: {
        isLocked: true,
        failedAttempts: attempts,
        lockUntil,
      },
    });

    return {
      locked: true,
      message: `Too many failed attempts. Account locked for  ${lockUntil?.toLocaleString()}.`,
      redirect: "/account-locked",
      lockUntil,
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: attempts },
  });

  return {
    locked: false,
    attemptsLeft: 5 - attempts,
  };
}

export async function resetAttempts(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedAttempts: 0,
      isLocked: false,
      lockUntil: null,
    },
  });
}
